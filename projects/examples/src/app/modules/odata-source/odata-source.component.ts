import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ODataDataSource } from 'projects/ngx-mat-extras/src/lib/odata';

@Component({
  selector: 'app-odata-source',
  templateUrl: './odata-source.component.html',
  styleUrls: ['./odata-source.component.scss'],
})
export class OdataSourceComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  loading$: Observable<boolean>;

  title = 'odata-data-source-demo';
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

  constructor(private readonly httpClient: HttpClient) {
    // datasource creation, the URL is left blank for testing pourposes but can be specified
    this.dataSource = new ODataDataSource(this.httpClient, '', 10);
    // debounce in loading to avoid showing it when tere is little delay
    this.loading$ = this.dataSource.loading.pipe(debounceTime(200));
  }

  ngOnInit() {}

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
}
