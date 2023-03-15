import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinct, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import {
  ODataComplexFilter,
  ODataContainsFilter,
  ODataDataSource,
  ODataEqFilter,
  ODataFilter,
} from 'projects/ngx-mat-extras/src/public-api';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';

interface ISearchForm {
  filter?: FormControl<string | undefined>;
  shippedDate?: FormControl<DateTime | null | undefined>;
  shippedTime: FormControl<string | undefined>;
}

@Component({
  selector: 'app-odata-source',
  templateUrl: './odata-source.component.html',
  styleUrls: ['./odata-source.component.scss'],
})
export class OdataSourceComponent implements OnInit, OnDestroy, AfterViewInit {
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  loading$: Observable<boolean>;

  searchForm = new FormGroup({
    filter: new FormControl('', { nonNullable: true }),
    shippedDate: new FormControl<DateTime | null>(null),
    shippedTime: new FormControl('', { nonNullable: true }),
  });
  // mat - table colums to display
  displayedColumns: string[] = [
    'CustomerName',
    'OrderID',
    'ProductID',
    'ProductName',
    'Salesperson',
    'ShippedDate',
    'ShipperName',
    'Discount',
    'Quantity',
    'UnitPrice',
  ];

  dataSource: ODataDataSource;

  constructor(private readonly httpClient: HttpClient) {
    // datasource creation, the URL is left blank for testing pourposes but can be specified
    this.dataSource = new ODataDataSource(this.httpClient, '', 10);
    // debounce in loading to avoid showing it when tere is little delay
    this.loading$ = this.dataSource.loading.pipe(debounceTime(200));
  }

  public clear(): void {
    if (this.dataSource) this.dataSource.clear();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * Dinamic filter generation
   */
  private refreshList(
    filters: Partial<{
      filter: string;
      shippedDate: DateTime | null;
      shippedTime: string;
    }>
  ) {
    let searchTerm = filters.filter || '';
    let odata_filters: ODataFilter[] = [];
    if (isNaN(+searchTerm)) {
      let odataFilter = new ODataContainsFilter([
        'ProductName',
        'CustomerName',
        'Salesperson',
      ]);
      odataFilter.filter_expression = searchTerm.toString();
      odata_filters.push(odataFilter);
    } else {
      let odataFilter = new ODataEqFilter(['ProductID', 'OrderID']);
      odataFilter.filter_expression = +searchTerm;
      odata_filters.push(odataFilter);
    }

    if (DateTime.isDateTime(filters.shippedDate)) {
      let date = filters.shippedDate as DateTime;
      let filterDate = DateTime.fromFormat(
        date.toFormat('yyyy-MM-dd') + ' ' + filters.shippedTime,
        'yyyy-MM-dd hh:mm:ss'
      );
      let odataFilter = new ODataComplexFilter({
        ShippedDate: {
          gt: filterDate.isValid
            ? filterDate.toJSDate()
            : filters.shippedDate.toJSDate(),
        },
      });
      odata_filters.push(odataFilter);
    }

    this.dataSource.filters = odata_filters;
    this.paginator.firstPage();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit() {
    this.searchForm.valueChanges
      .pipe(takeUntil(this._onDestroy), distinct(), debounceTime(500))
      .subscribe((value) => this.refreshList(value));
  }

  ngAfterViewInit() {
    // DataSource sort and paginator must be configured in ngAfterViewInit
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.urlParams = { tst: 'im a test parameter' };
    // the url can be changed
    this.dataSource.url =
      'https://services.odata.org/Experimental/Northwind/Northwind.svc/Invoices';

    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
