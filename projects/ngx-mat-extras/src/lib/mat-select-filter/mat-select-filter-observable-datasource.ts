import {
  combineLatest,
  isObservable,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { tap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatSelectFilterDataSource } from './mat-select-filter-datasource';
/**
 * implementation of @type MatSelectFilterDataSource that's allows a @type Observable data source.
 */
export class MatSelectFilterObservableDataSource<
  T
> extends MatSelectFilterDataSource<T> {
  /**
   * Creates a new instance of
   * @param source observable source
   * @param filterProperty The data source will filter the input text with this property. Nested properties are allowed see https://lodash.com/docs/4.17.15#get
   * @param keyProperty The data source will set the selected value with this property. Nested properties are allowed see https://lodash.com/docs/4.17.15#get
   * @param groupByProperty
   */
  constructor(
    private readonly source: Observable<T[]> | T[],
    private readonly filterProperty: string,
    private readonly keyProperty: string,
    private readonly groupByProperty: string = ''
  ) {
    super();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ODataSource<T> implementation
  // -----------------------------------------------------------------------------------------------------
  protected subscription: Subscription | undefined;

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
   * Creates an bundle of parameter observables
   * @returns
   */
  private getObservable(): Observable<T[]> {
    if (!this.source) return of([]);

    let source$ = isObservable(this.source) ? this.source : of(this.source);
    /*
    if (this.groupByProperty)
      source$ = source$.pipe(map((item) => _.groupBy(item, this.groupByProperty))
    );
*/
    this.loadingSubject.next(true);
    // buscar por TEXTO
    return combineLatest([
      source$,
      this.txtFilterSubject,
      this.idFiltersSubject,
    ]).pipe(
      map(([source, txtFilter, idFilter]) => {
        let filtered = source.filter(
          (item: any) =>
            _.get(item, this.filterProperty)
              .toLowerCase()
              .includes(txtFilter.toLowerCase()) ||
            _.get(item, this.keyProperty) == idFilter // para incluir siempre el valor seleccionado
        );

        let selectedItem = filtered.filter(
          (item: any) => _.get(item, this.keyProperty) == idFilter
        );

        if (selectedItem.length > 0) {
          this.selectedDataSubject$.next(selectedItem[0]);
        }

        return filtered;
      }),
      tap(() => this.loadingSubject.next(false))
    );
  }
  /**
   * Sets the value of teh selectd data using the key property and value
   * @param key
   */
  setSelectedData(key: any): void {
    let data = this.dataSubject.value;
    let selected = _.filter(
      data,
      (item) => _.get(item, this.keyProperty) == key
    );
    if (selected.length > 0) {
      this.selectedDataSubject$.next(selected[0]);
    } else {
      // no esta en los datos entonces busca
      this.idFilter = key;
    }
  }
}
