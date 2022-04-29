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
import { MatPaginator } from '@angular/material/paginator';
import { ODataFilter } from './models/odata-filter';
import buildQuery from 'odata-query';

export class ODataDataSource extends DataSource<any> {
  sort: MatSort | undefined;
  paginator: MatPaginator | undefined;
  selectedFields: string[] = [];
  initialSort: string[] = [];

  protected readonly isEnabledSubject: BehaviorSubject<boolean>;
  protected readonly filtersSubject = new BehaviorSubject<ODataFilter[]>([]);
  protected readonly urlSubject: BehaviorSubject<string>;

  protected subscription: Subscription | undefined;
  public readonly dataSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  protected readonly loadingSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  protected readonly errorSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);

  /**
   * Crea una nueva instancia de la clase ODataDataSource
   * @param httpClient cliente http para hacer la llamada
   * @param initUrl URL inicial (opcional)
   * @param debounceMillis tiempo de debounce ante cambios (opcional)
   * @param isEnabled si esta habilitada la busqueda ante un cambio (opcional)
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
          this.urlSubject.value,
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
   * Crea un observable con todos los parametros uqe cambian
   * @returns
   */
  private getObservable(): Observable<any> {
    const toObserve = [
      this.urlSubject,
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

  connect(): Observable<any[]> {
    if (!this.subscription || this.subscription.closed) {
      this.subscription = this.createObservablePipe().subscribe((result) =>
        this.dataSubject.next(result)
      );
    }

    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    if (this.subscription && this.dataSubject.observers.length === 0) {
      this.subscription.unsubscribe();
    }
  }

  get data(): any[] {
    return this.dataSubject.value;
  }
  set data(data) {
    this.dataSubject.next(data);
  }

  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get errors(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  get filters(): ODataFilter[] {
    return this.filtersSubject.value;
  }
  set filters(filters: ODataFilter[]) {
    this.filtersSubject.next(filters);
  }

  public get url(): string {
    return this.urlSubject.value;
  }

  public set url(v: string) {
    this.urlSubject.next(v);
  }

  refresh(): void {
    this.filtersSubject.next(this.filtersSubject.value);
  }

  protected getData(
    url: string,
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
