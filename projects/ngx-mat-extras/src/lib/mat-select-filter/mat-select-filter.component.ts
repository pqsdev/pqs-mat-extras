import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  AfterContentChecked,
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  NG_VALUE_ACCESSOR,
  ControlContainer,
  ControlValueAccessor,
} from '@angular/forms';
import { A, Z, ZERO, NINE, SPACE, END, HOME } from '@angular/cdk/keycodes';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CollectionViewer, isDataSource } from '@angular/cdk/collections';
import { MatSelectFilterDataSource } from './mat-select-filter-datasource';

@Component({
  selector: 'mat-select-filter',
  template: `
    <form [formGroup]="searchForm" class="mat-filter  mat-app-background">
      <div>
        <input
          #input
          class="mat-filter-input"
          matInput
          placeholder="{{ placeholder }}"
          formControlName="value"
          (keydown)="handleKeydown($event)"
        />
        <mat-spinner
          *ngIf="localSpinner"
          class="spinner"
          diameter="16"
        ></mat-spinner>
      </div>
      <div *ngIf="noResults" class="noResultsMessage">
        {{ noResultsMessage }}
      </div>
    </form>
  `,
  styleUrls: ['./mat-select-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MatSelectFilterComponent,
    },
  ],
})
export class MatSelectFilterComponent<T>
  implements
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    AfterContentChecked,
    CollectionViewer
{
  private readonly _onDestroy = new Subject<void>();

  private selectedValue$ = new BehaviorSubject<any | undefined>(undefined);

  @Input()
  get dataSource(): MatSelectFilterDataSource<T> {
    return this._dataSource;
  }
  set dataSource(dataSource: MatSelectFilterDataSource<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource!: MatSelectFilterDataSource<T>;

  @Input() debounce = 200;
  @Input() formControlName!: string;
  @Input('placeholder')
  placeholder: string = 'Search..';
  @Input('noResultsMessage') noResultsMessage = 'No results';

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription: Subscription | null = null;

  noResults = false;
  localSpinner = false;

  /**
   * Observable uqe emite los valores filtrados
   */
  public filteredItems$ = new BehaviorSubject<T[]>([]);

  public searchForm: UntypedFormGroup;

  constructor(fb: UntypedFormBuilder, private controlContainer: ControlContainer) {
    this.searchForm = fb.group({
      value: '',
    });
  }

  handleKeydown(event: KeyboardEvent) {
    // PREVENT PROPAGATION FOR ALL ALPHANUMERIC CHARACTERS IN ORDER TO AVOID SELECTION ISSUES
    if (
      (event.key && event.key.length === 1) ||
      (event.keyCode >= A && event.keyCode <= Z) ||
      (event.keyCode >= ZERO && event.keyCode <= NINE) ||
      event.keyCode === SPACE ||
      event.keyCode === END ||
      event.keyCode === HOME
    ) {
      event.stopPropagation();
    }
  }

  onChange = (value: number) => {};

  onTouched = () => {};

  touched = false;

  disabled = false;

  writeValue(selectedValue: any, isInternal = false) {
    if (isInternal) {
      this.dataSource.setSelectedData(selectedValue);
    } else {
      this.selectedValue$.next(selectedValue);
    }
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Set up a subscription for the data provided by the data source. */
  private _observeRenderChanges() {
    // If no data source has been set, there is nothing to observe for changes.
    if (!this.dataSource) {
      return;
    }

    let dataStream = this.dataSource.connect(this);

    this._renderChangeSubscription = dataStream!
      .pipe(takeUntil(this._onDestroy))
      .subscribe();
  }
  /**
   * Switch to the provided data source by resetting the data and unsubscribing from the current
   * render change subscription if one exists. If the data source is null, interpret this by
   * clearing the row outlet. Otherwise start listening for new data.
   */
  private _switchDataSource(dataSource: MatSelectFilterDataSource<T>) {
    if (isDataSource(this.dataSource)) {
      this.dataSource.disconnect(this);
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    if (dataSource) {
      dataSource.idFilter = this.selectedValue$.value;
      dataSource.txtFilter = this.searchForm.value.value;
      dataSource.loading
        .pipe(takeUntil(this._onDestroy))
        .subscribe((loading) => (this.localSpinner = loading));
    }

    this._dataSource = dataSource;
  }
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   *
   * @docs-private
   */
  readonly viewChange = new BehaviorSubject<{ start: number; end: number }>({
    start: 0,
    end: Number.MAX_VALUE,
  });
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    if (this.controlContainer)
      this.controlContainer.control
        ?.get(this.formControlName)!
        .valueChanges!.pipe(takeUntil(this._onDestroy), distinctUntilChanged())
        .subscribe((value) => {
          if (value != this.selectedValue$.value) {
            this.writeValue(value, true);
          }
        });

    this.searchForm.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        distinctUntilChanged(),
        debounceTime(200)
      )
      .subscribe((formData) => {
        let textValue = formData['value'] || '';
        if (this.dataSource) this.dataSource.txtFilter = textValue;
      });

    this.selectedValue$
      .pipe(takeUntil(this._onDestroy), distinctUntilChanged())
      .subscribe((id) => {
        if (this.dataSource) this.dataSource.idFilter = id;
      });
  }

  ngAfterContentChecked(): void {
    if (this.dataSource && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
