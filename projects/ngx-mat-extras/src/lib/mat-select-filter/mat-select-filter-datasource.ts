import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
/**
 * Abstract data data source for @type MatSelectFilterComponent . All MatSelectFilterComponent must implement this abstract class
 */
export abstract class MatSelectFilterDataSource<T> extends DataSource<T> {
  /**
   * Emmits a value every time the {@link txtFilter} changes
   */
  protected readonly txtFilterSubject = new BehaviorSubject<string>('');

  /**
   * Gets the text filter value
   */
  get txtFilter(): string {
    return this.txtFilterSubject.value;
  }
  /**
   * Sets the text filter value
   */
  set txtFilter(value: string) {
    this.txtFilterSubject.next(value);
  }
  /**
   * Clears teh txt value if conditional is true
   * @param conditional
   */
  clear(conditional: boolean) {
    if (conditional) this.txtFilterSubject.next('');
  }
  /**
   * Emmits a value every time the {@link idFilter} changes
   */
  protected readonly idFiltersSubject = new BehaviorSubject<any>(undefined);

  /**
   * Gets the id filter value
   */
  get idFilter(): any {
    return this.idFiltersSubject.value;
  }

  /**
   * Sets the id filter value
   */
  set idFilter(value: any) {
    this.idFiltersSubject.next(value);
  }

  protected readonly loadingSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  /**
   * Emmits `true` when loading `false` when finished or error
   */
  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  protected readonly errorSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);
  /**
   * Emmits value if there is an error
   */
  get errors(): Observable<any> {
    return this.errorSubject.asObservable();
  }
  /**
   * Emmits value every time the filtered data changes
   */
  dataSubject = new BehaviorSubject<T[]>([]);

  protected selectedDataSubject$ = new BehaviorSubject<T | undefined>(
    undefined
  );

  /**
   * Emmits value with the object in the list asociated with the selected value
   */
  selectedValueChanged: Observable<T | undefined> =
    this.selectedDataSubject$.pipe(
      filter((item) => item != undefined),
      distinctUntilChanged()
    );

  // -----------------------------------------------------------------------------------------------------
  // @ Abstract Methods
  // -----------------------------------------------------------------------------------------------------

  abstract setSelectedData(key: any): void;
}
