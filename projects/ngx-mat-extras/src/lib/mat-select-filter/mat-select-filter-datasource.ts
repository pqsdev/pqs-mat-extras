import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

export abstract class MatSelectFilterDataSource<T> extends DataSource<T> {
  protected readonly txtFilterSubject = new BehaviorSubject<string>('');
  /**
   * Filtro por descripcion
   */
  get txtFilter(): string {
    return this.txtFilterSubject.value;
  }
  set txtFilter(value: string) {
    this.txtFilterSubject.next(value);
  }
  clear(conditional: boolean) {
    if (conditional) this.txtFilterSubject.next('');
  }

  protected readonly idFiltersSubject = new BehaviorSubject<any>(undefined);

  /**
   * Filtro por id
   */
  get idFilter(): any {
    return this.idFiltersSubject.value;
  }

  set idFilter(value: any) {
    this.idFiltersSubject.next(value);
  }

  protected readonly loadingSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  /**
   * Observable que emite un valor cuando la informacion se esta cargando
   */
  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  protected readonly errorSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);
  /**
   * Observable que emite un valor si da error la llamada de HTTP
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
