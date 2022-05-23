import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  ObservableInput,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import { switchMap, tap, map, debounceTime } from 'rxjs/operators';
import buildQuery, { OrderBy } from 'odata-query';
import * as _ from 'lodash';
import { MatSelectFilterDataSource } from './mat-select-filter-datasource';
import { ODataFilter } from '../odata/models';
import { MatTableDataSourcePaginator } from '@angular/material/table';

/**
 * Base para origenes de datos O-DATA
 */
export abstract class MatSelectFilterODataSource<
  T,
  P extends MatTableDataSourcePaginator = MatTableDataSourcePaginator
> extends MatSelectFilterDataSource<T> {
  // -----------------------------------------------------------------------------------------------------
  // @ Properties
  // -----------------------------------------------------------------------------------------------------
  selectedFields: string | string[] | undefined;
  orderBy: OrderBy<T> | any | undefined;

  protected readonly urlSubject: BehaviorSubject<string>;
  /**
   * Resource location URL
   */
  public get url(): string {
    return this.urlSubject.value;
  }

  public set url(v: string) {
    this.urlSubject.next(v);
  }

  protected readonly isEnabledSubject: BehaviorSubject<boolean>;
  /**
   * if @constant false no search will be performed until @constant true
   */
  public get isEnabled(): boolean {
    return this.isEnabledSubject.value;
  }

  public set isEnabled(v: boolean) {
    this.isEnabledSubject.next(v);
  }

  protected readonly filtersSubject = new BehaviorSubject<ODataFilter | null>(
    null
  );
  /**
   * Aditional filters {@link txtFilter}
   */
  get filters(): ODataFilter | null {
    return this.filtersSubject.value;
  }
  set filters(filters: ODataFilter | null) {
    this.filtersSubject.next(filters);
  }

  protected readonly pageSubject: BehaviorSubject<number>;
  /**
   * Incremental page number, ignored if {@link paginator}  is set.
   */
  public get page(): number {
    return this.pageSubject.value;
  }

  public set page(v: number) {
    this.pageSubject.next(v);
  }
  /**
   * Incremental page size, ignored if {@link paginator}  is set .
   */
  protected readonly pageSizeSubject: BehaviorSubject<number>;
  /**
   *
   */
  public get pageSize(): number {
    return this.pageSizeSubject.value;
  }

  public set pageSize(v: number) {
    this.pageSizeSubject.next(v);
  }

  /**
   * Instance of the MatPaginator component used by the table to control what page of the data is
   * displayed. Page changes emitted by the MatPaginator will trigger an update to the
   * table's rendered data.
   *
   * Note that the data source uses the paginator's properties to calculate which page of data
   * should be displayed. If the paginator receives its properties as template inputs,
   * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
   * initialized before assigning it to this data source.
   */
  get paginator(): P | null {
    return this._paginator;
  }
  set paginator(paginator: P | null) {
    this._paginator = paginator;
    this.disconnect();
    this.connect();
    //this._updateChangeSubscription();
  }
  private _paginator: P | null = null;

  /**
   * Current page count
   */
  public count$ = new Subject<number>();
  /**
   * Total page count
   */
  public countTotal$ = new Subject<number>();
  /**
   * Last page reach
   */
  public completed$ = new BehaviorSubject<boolean>(false);

  protected subscription: Subscription | undefined;

  /**
   * Crea una nueva instancia de la clase ODataDataSource
   * @param httpClient cliente http para hacer la llamada
   * @param initUrl URL inicial (opcional)
   * @param debounceMillis tiempo de debounce ante cambios (opcional)
   * @param isEnabled si esta habilitada la busqueda ante un cambio (opcional)
   */
  constructor(
    protected readonly httpClient: HttpClient,
    initUrl: string = '',
    protected readonly debounceMillis = 0,
    isEnabled = true,
    pageSize = 10
  ) {
    super();
    this.urlSubject = new BehaviorSubject<string>(initUrl);
    this.isEnabledSubject = new BehaviorSubject<boolean>(isEnabled);
    this.pageSubject = new BehaviorSubject<number>(0);
    this.pageSizeSubject = new BehaviorSubject<number>(pageSize);

    this.txtFilterSubject.subscribe((filter) => {
      this.page = 0;

      if (this._paginator) this._paginator.pageIndex = 0;
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Abstract Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Maps the text filter value to a valid odata-query filter
   * @param txt entered filter text
   * @param id current selected id
   * @returns Must return a filter witch selects the records that mach the critiria and excludes the id
   */
  abstract txtFilterMap(txt: string, id: any): any;
  /**
   * Maps the id filter value to a valid odata-query filter
   * @param id current selected id
   * @returns Must return a filter witch selects the current value
   */
  abstract idFilterMap(id: any): any;

  // -----------------------------------------------------------------------------------------------------
  // @ ODataSource<T> implementation
  // -----------------------------------------------------------------------------------------------------
  connect(): Observable<any[]> {
    // si la subscripcion no esta creada o esta cerrada
    if (!this.subscription || this.subscription.closed) {
      this.subscription = this.getObservable().subscribe((result) =>
        this.dataSubject.next(result)
      );
    }

    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    if (this.subscription && this.dataSubject.observed) {
      this.subscription.unsubscribe();
    }
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

    let pageToObserve: Observable<any>[] = [];

    if (this._paginator) {
      pageToObserve = [this._paginator.initialized, this._paginator.page];
    } else {
      pageToObserve = [this.pageSubject, this.pageSizeSubject];
    }

    // buscar por TEXTO
    const txt$ = merge(
      ...toObserve,
      this.txtFilterSubject,
      this.idFiltersSubject,
      ...pageToObserve
    ).pipe(
      // loading is set to true
      tap(() => this.loadingSubject.next(true)),
      debounceTime(this.debounceMillis),
      switchMap(() => {
        if (!(this.urlSubject.value && this.isEnabled)) {
          return of([]);
        }

        let filters = this.txtFilterMap(this.txtFilter, this.idFilter);
        // adtitional filters are set with AND
        if (this.filtersSubject.value) {
          filters = {
            and: [filters, this.filtersSubject.value.getFilter()],
          };
        }

        let top = 0;
        let skip = 0;

        if (this._paginator) {
          // ifa paginator is defines it uses it
          skip = this._paginator.pageIndex * this._paginator.pageSize;
          top = this._paginator.pageSize;
        } else {
          // this is when a infinity scroll is defined and additive top is used
          top = (this.page + 1) * this.pageSize;
          skip = 0;
        }

        return this.getData(filters, top, skip).pipe(
          map((data) => {
            this.countTotal$.next(data.count);
            this.count$.next(data.value.length);
            this.completed$.next(data.value.length == data.count);
            this._updatePaginator(data.count);
            return data.value;
          })
        );
      })
    );

    // serach by ID
    const id$ = merge(...toObserve, this.idFiltersSubject).pipe(
      debounceTime(this.debounceMillis),
      switchMap(() => {
        if (
          !(
            this.urlSubject.value &&
            this.isEnabled &&
            this.idFiltersSubject.value
          )
        ) {
          return of([]);
        }

        let filters = this.idFilterMap(this.idFilter);
        return this.getData(filters, 0, 0).pipe(
          map((data) => {
            return data.value;
          })
        );
      }),
      tap((result) => {
        if (result && result.length > 0)
          this.selectedDataSubject$.next(result[0]);
      })
    );

    return combineLatest([txt$, id$]).pipe(
      map(([txtResults, idResults]) => {
        const data = [...(idResults || []), ...(txtResults || [])];
        return data;
      }),
      // loading is set to false
      tap(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Extrae los resultados del formato ODATA
   * @param result
   * @returns
   */
  private _mapODataResults(result: any): {
    count: number;
    value: T[];
  } {
    if (result.value) {
      return {
        count: result['@odata.count'] ?? 0,
        value: result.value,
      };
    } else {
      return {
        count: result['@odata.count'] ?? 0,
        value: result,
      };
    }
  }

  refresh(): void {
    this.filtersSubject.next(this.filtersSubject.value);
  }

  protected getData(
    filters: any,
    top?: number,
    skip?: number
  ): Observable<{
    count: number;
    value: T[];
  }> {
    const query = {} as any;

    if (this.selectedFields) query.select = this.selectedFields;

    if (this.orderBy) query.orderBy = this.orderBy;
    if (top || skip) {
      query.top = top;
      query.skip = skip;
      query.count = true;
    }

    if (filters) {
      if (Array.isArray(filters)) {
        const filterQuery: { and: any[] } = { and: [] };

        filters.forEach((filter: any) => {
          filterQuery.and.push(filter.getFilter());
        });

        query.filter = filterQuery;
      } else query.filter = filters;
    }
    let url = this.url + buildQuery(query);

    return this.httpClient
      .get(url)
      .pipe(map((data) => this._mapODataResults(data)));
  }

  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the paginator's last page. Values are changed in a resolved promise to
   * guard against making property changes within a round of change detection.
   */
  protected _updatePaginator(filteredDataLength: number) {
    Promise.resolve().then(() => {
      const paginator = this.paginator;

      if (!paginator) {
        return;
      }

      paginator.length = filteredDataLength;

      // If the page index is set beyond the page, reduce it to the last page.
      if (paginator.pageIndex > 0) {
        const lastPageIndex =
          Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
        const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);

        if (newPageIndex !== paginator.pageIndex) {
          paginator.pageIndex = newPageIndex;

          // Since the paginator only emits after user-generated changes,
          // we need our own stream so we know to should re-render the data.
          //this._internalPageChanges.next();
        }
      }
    });
  }
}
