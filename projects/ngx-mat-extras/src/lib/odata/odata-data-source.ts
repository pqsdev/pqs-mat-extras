import { DataSource } from '@angular/cdk/table';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of as observableOf,
  merge,
  BehaviorSubject,
  ObservableInput,
  Subscription,
  of,
} from 'rxjs';
import { switchMap, tap, map, catchError, debounceTime } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { ODataFilter } from './models/odata-filter';
import buildQuery from 'odata-query';
/**
 * DATA TYPE USER FOR A COLLECTION OF URL PARAMETERS USED IN URLSearchParams native function
 */
export type URLParamsType =
  | URLSearchParams
  | string
  | Record<string, string>
  | string[][]
  | null;
/**
 * ODATA Data Sorurce of Angular CDK @type { DataSource }
 */
export class ODataDataSource<T = any> extends DataSource<T> {
  sort: MatSort | undefined;
  paginator: MatPaginator | undefined;
  selectedFields: string[] = [];
  initialSort: string[] = [];

  protected readonly isEnabledSubject: BehaviorSubject<boolean>;
  protected readonly filtersSubject = new BehaviorSubject<ODataFilter[]>([]);
  protected readonly urlSubject: BehaviorSubject<string>;
  protected readonly urlParamsSubject = new BehaviorSubject<URLParamsType>(
    null
  );

  protected subscription: Subscription | undefined;
  public readonly dataSubject: BehaviorSubject<T[] | any[]> =
    new BehaviorSubject<T[] | any[]>([]);
  protected readonly loadingSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  protected readonly errorSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);

  /**
   * New instance of @type { ODataDataSource }
   * @param httpClient
   * @param initUrl
   * @param debounceMillis
   * @param isEnabled
   */
  constructor(
    private readonly httpClient: HttpClient,
    initUrl: string = '',
    private readonly debounceMillis = 0,
    isEnabled = true
  ) {
    super();
    this.urlSubject = new BehaviorSubject<string>(initUrl);
    this.isEnabledSubject = new BehaviorSubject<boolean>(isEnabled);
  }

  private createObservablePipe(): Observable<any[]> {
    const observable = this.getObservable();

    if (!(this.urlSubject.value && this.isEnabledSubject.value)) {
      return of([]);
    }

    return observable.pipe(
      debounceTime(this.debounceMillis), // mato dos pajaros de un tiro, un error loco cuando se usa el loading y un debounce para todo. ver  https://blog.angular-university.io/angular-debugging/
      switchMap(() => {
        this.loadingSubject.next(true);

        let page = 0;
        if (this.paginator) {
          page = this.paginator.pageIndex;
        }

        let sortBy = '';
        let sortOrder = '';
        if (this.sort) {
          sortBy = this.sort.active;
          sortOrder = this.sort.direction;
        }

        const result = this.getData(
          this.url,
          this.urlParams,
          page,
          sortBy,
          sortOrder,
          this.filtersSubject.value
        );

        return result.pipe(
          tap(() => {
            if (this.errorSubject.value != null) {
              this.errorSubject.next(null);
            }
          }),
          catchError((error) => {
            this.errorSubject.next(error);
            return observableOf({ data: [] });
          })
        );
      }),
      tap((result) => {
        if (this.paginator) {
          this.paginator.length = result['@odata.count'];
        }
        this.loadingSubject.next(false);
      }),
      map(this.mapResult)
    );
  }

  /**
   * Observable with parameters
   * @returns
   */
  private getObservable(): Observable<any> {
    const toObserve = [
      this.urlSubject,
      this.urlParamsSubject,
      this.isEnabledSubject,
      this.filtersSubject,
    ] as Array<ObservableInput<any>>;

    if (this.paginator) {
      toObserve.push(this.paginator.page);
    }
    if (this.sort) {
      toObserve.push(this.sort.sortChange);
    }

    return merge(...toObserve);
  }

  /**
   * Connects a collection viewer (such as a data-table) to this data source. Note that
   * the stream provided will be accessed during change detection and should not directly change
   * values that are bound in template views.
   * @returns Observable that emits a new value when the data changes.
   */
  connect(): Observable<T[] | any[]> {
    if (!this.subscription || this.subscription.closed) {
      this.subscription = this.createObservablePipe().subscribe((result) =>
        this.dataSubject.next(result)
      );
    }

    return this.dataSubject.asObservable();
  }

  /**
   * Disconnects a collection viewer (such as a data-table) from this data source. Can be used
   * to perform any clean-up or tear-down operations when a view is being destroyed.
   *
   */
  disconnect(): void {
    if (this.subscription && this.dataSubject.observers.length === 0) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Clear results
   * @returns void
   */
  clear(): void {
    if (this.paginator) this.paginator.length = 0;

    return this.dataSubject.next([]);
  }

  /** Gets the las data returned  by de odata query*/
  get data(): T[] | any[] {
    return this.dataSubject.value;
  }

  /** Loading indicator*/
  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /** Errors returnes in the odata query*/
  get errors(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  /**
   * Return the filters set to de @type ODataSoruce
   */
  get filters(): ODataFilter[] {
    return this.filtersSubject.value;
  }

  /**
   * Sets the  @type ODataSoruce filters
   */
  set filters(filters: ODataFilter[]) {
    this.filtersSubject.next(filters);
  }

  /**
   * Gets the base URL for the OData Query
   */
  public get url(): string {
    return this.urlSubject.value;
  }

  /**
   * Sets the base URL for the OData Query
   */
  public set url(v: string) {
    this.urlSubject.next(v);
  }

  /**
   * If false the ODataSoruce will not refrresh
   */
  public get enabled(): boolean {
    return this.isEnabledSubject.value;
  }

  /**
   * If false the ODataSoruce will not refrresh
   */
  public set enabled(v: boolean) {
    this.isEnabledSubject.next(v);
  }

  /**
   * Get the aditional URL params for the OData Query
   */
  public get urlParams(): URLParamsType {
    return this.urlParamsSubject.value;
  }

  /**
   * Sets the aditional URL params for the OData Query
   */
  public set urlParams(v: URLParamsType) {
    this.urlParamsSubject.next(v);
  }

  /**
   * Execute the las ODataQuery one more time
   */
  refresh(): void {
    this.filtersSubject.next(this.filtersSubject.value);
  }

  protected getData(
    url: string,
    urlParams: URLParamsType,
    page: number,
    sortBy: string,
    order: string,
    filters: ODataFilter[]
  ): Observable<any> {
    const query = {} as any;

    if (this.paginator) {
      const perPage = this.paginator.pageSize;
      query.top = perPage;
      query.skip = perPage * page;
      query.count = true;
    }

    if (this.selectedFields && this.selectedFields.length > 0) {
      query.select = this.selectedFields;
    }

    if (sortBy && order) {
      if (order === 'asc') {
        query.orderBy = [sortBy];
      } else if (order === 'desc') {
        query.orderBy = [`${sortBy} desc`];
      }
    } else if (this.initialSort && this.initialSort.length) {
      query.orderBy = this.initialSort;
    }

    if (filters) {
      const filterQuery: { and: any[] } = { and: [] };
      filters.forEach((filter) => {
        filterQuery.and.push(filter.getFilter());
      });

      query.filter = filterQuery;
    }
    url += buildQuery(query);

    if (urlParams) {
      if (url.indexOf('?') < 0) {
        url += '?';
      } else {
        url += '&';
      }

      url += new URLSearchParams(urlParams).toString();
    }
    return this.httpClient.get(url) as Observable<object>;
  }

  mapResult(result: any): any[] {
    if (result.value) {
      return result.value;
    } else {
      return result;
    }
  }
}
