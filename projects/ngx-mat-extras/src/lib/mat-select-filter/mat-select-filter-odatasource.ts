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
import { ODataFilter } from '../odata';

/**
 * Base para origenes de datos O-DATA
 */
export abstract class MatSelectFilterODataSource<
  T
> extends MatSelectFilterDataSource<T> {
  // -----------------------------------------------------------------------------------------------------
  // @ Properties
  // -----------------------------------------------------------------------------------------------------
  selectedFields: string | string[] | undefined;
  orderBy: OrderBy<T> | any | undefined;

  protected readonly isEnabledSubject: BehaviorSubject<boolean>;
  public get isEnabled(): boolean {
    return this.isEnabledSubject.value;
  }

  public set isEnabled(v: boolean) {
    this.isEnabledSubject.next(v);
  }

  protected readonly pageSubject: BehaviorSubject<number>;
  public get page(): number {
    return this.pageSubject.value;
  }

  public set page(v: number) {
    this.pageSubject.next(v);
  }

  protected readonly pageSizeSubject: BehaviorSubject<number>;
  public get pageSize(): number {
    return this.pageSizeSubject.value;
  }

  public set pageSize(v: number) {
    this.pageSizeSubject.next(v);
  }

  public count$ = new Subject<number>();
  public countTotal$ = new Subject<number>();

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

  protected readonly filtersSubject = new BehaviorSubject<ODataFilter[]>([]);
  /**
   * Filtros fijos adicionales a {@link idFilter} {@link txtFilter}
   */
  get filters(): ODataFilter[] {
    return this.filtersSubject.value;
  }
  set filters(filters: ODataFilter[]) {
    this.filtersSubject.next(filters);
  }

  protected readonly urlSubject: BehaviorSubject<string>;
  /**
   * Url donde se encuentran los recursos
   */
  public get url(): string {
    return this.urlSubject.value;
  }

  public set url(v: string) {
    this.urlSubject.next(v);
  }

  protected subscription: Subscription | undefined;

  // -----------------------------------------------------------------------------------------------------
  // @ ODataSource<T> implementation
  // -----------------------------------------------------------------------------------------------------
  connect(): Observable<any[]> {
    // si la subscripcion no esta creada o esta cerrada
    if (!this.subscription || this.subscription.closed) {
      this.subscription = this.createObservablePipe().subscribe((result) =>
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

  private createObservablePipe(): Observable<T[]> {
    const observable = this.getObservable();
    return observable;
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
    // LOADING

    // buscar por TEXTO
    const txt$ = merge(
      ...toObserve,
      this.txtFilterSubject,
      this.idFiltersSubject,
      this.pageSubject,
      this.pageSizeSubject
    ).pipe(
      tap(() => this.loadingSubject.next(true)), // el loading esta solo aca por que se dispara con tolo lo que puee cambiar
      debounceTime(this.debounceMillis),
      switchMap(() => {
        if (!(this.urlSubject.value && this.isEnabled)) {
          return of([]);
        }

        let filters = this.txtFilterMap(this.txtFilter, this.idFilter);
        return this.getData(filters, this.page, this.pageSize);
      })
    );

    // buscar por ID
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
        return this.getData(filters);
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
      tap(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Extrae los resultados del formato ODATA
   * @param result
   * @returns
   */
  private _mapODataResults(result: any): T[] {
    if (result.value) {
      return result.value;
    } else {
      return result;
    }
  }

  refresh(): void {
    this.filtersSubject.next(this.filtersSubject.value);
  }

  protected getData(
    filters: any,
    page?: number,
    pageSize?: number
  ): Observable<T[]> {
    const query = {} as any;

    if (this.selectedFields) query.select = this.selectedFields;

    if (this.orderBy) query.orderBy = this.orderBy;
    if (page && pageSize) query.top = (pageSize ?? 0) * (page + 1);

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
    return this.httpClient.get(url).pipe(map(this._mapODataResults));
  }
}
