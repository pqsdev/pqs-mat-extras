import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSelectFilterComponent,
  MatSelectFilterFastODataSource,
  MatSelectFilterObservableDataSource,
} from 'projects/ngx-mat-extras/src/public-api';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-filter',
  templateUrl: './select-filter.component.html',
  styleUrls: ['./select-filter.component.scss'],
})
export class SelectFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  private _onDestroy = new Subject<void>();
  theForm: FormGroup;

  @ViewChild('productFilter') productFiler!: MatSelectFilterComponent<any>;
  @ViewChild('productPaginator') productPaginator!: MatPaginator;
  productDataSource!: MatSelectFilterFastODataSource<any>;

  productDataSource2!: MatSelectFilterFastODataSource<any>;

  countriesDataSoruce: MatSelectFilterObservableDataSource<any>;

  //url: 'https://services.odata.org/Experimental/Northwind/Northwind.svc/Categories'}

  constructor(private readonly httpClient: HttpClient, fb: FormBuilder) {
    this.theForm = fb.group({
      productId1: 17,
      productId2: 18,
      countryId: 'URY',
    });

    this.productDataSource = new MatSelectFilterFastODataSource<any>(
      this.httpClient,
      'https://services.odata.org/Experimental/Northwind/Northwind.svc/Products',
      0,
      true,
      ['ProductName', 'QuantityPerUnit'],
      'ProductID'
    );

    this.productDataSource2 = new MatSelectFilterFastODataSource<any>(
      this.httpClient,
      'https://services.odata.org/Experimental/Northwind/Northwind.svc/Products',
      0,
      true,
      ['ProductName', 'QuantityPerUnit'],
      'ProductID'
    );

    this.countriesDataSoruce = new MatSelectFilterObservableDataSource<any>(
      this.httpClient.get<any>('https://restcountries.com/v3.1/all'),
      'name.common',
      'cca3'
    );

    this.countriesDataSoruce.selectedValueChanged
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        console.log('PAIS: ', val);
      });
  }
  public getNextBatch() {
    this.productDataSource.page++;
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // More settings
    //this.productDataSource.orderBy = ['ProductName'];
    //this.productDataSource.selectedFields = ['ProductID', 'ProductName'];
    this.productDataSource.paginator = this.productPaginator;
    this.productDataSource.selectedValueChanged
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        console.log('PRODUCT: ', val);
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
