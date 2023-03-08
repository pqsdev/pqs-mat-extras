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

import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import {
  ODataContainsFilter,
  ODataDataSource,
  ODataEqFilter,
} from 'projects/ngx-mat-extras/src/public-api';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

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
  searchForm: UntypedFormGroup;
  // mat - table colums to display
  displayedColumns: string[] = [
    'CustomerName',
    'OrderID',
    'ProductID',
    'ProductName',
    'Salesperson',
    'ShipperName',
    'Discount',
    'Quantity',
    'UnitPrice',
  ];

  dataSource: ODataDataSource;

  constructor(fb: UntypedFormBuilder, private readonly httpClient: HttpClient) {
    // datasource creation, the URL is left blank for testing pourposes but can be specified
    this.dataSource = new ODataDataSource(this.httpClient, '', 10);
    // debounce in loading to avoid showing it when tere is little delay
    this.loading$ = this.dataSource.loading.pipe(debounceTime(200));
    this.searchForm = fb.group({
      filter: '',
    });
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
  private refreshList(searchTerm: any) {
    if (isNaN(searchTerm)) {
      let odataFilter = new ODataContainsFilter([
        'ProductName',
        'CustomerName',
        'Salesperson',
      ]);
      odataFilter.filter_expression = searchTerm;
      this.dataSource.filters = [odataFilter];
    } else {
      let odataFilter = new ODataEqFilter(['ProductID', 'OrderID']);
      odataFilter.filter_expression = +searchTerm;
      this.dataSource.filters = [odataFilter];
    }

    this.paginator.firstPage();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit() {
    this.searchForm.valueChanges
      .pipe(takeUntil(this._onDestroy), distinct(), debounceTime(500))
      .subscribe((value) => this.refreshList(value.filter));
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
