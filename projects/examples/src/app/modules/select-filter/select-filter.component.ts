import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MatSelectFilterFastODataSource,
  MatSelectFilterObservableDataSource,
} from 'projects/ngx-mat-extras/src/public-api';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-filter',
  templateUrl: './select-filter.component.html',
  styleUrls: ['./select-filter.component.scss'],
})
export class SelectFilterComponent implements OnInit {
  private _onDestroy = new Subject<void>();
  theForm: FormGroup;

  productDataSource: MatSelectFilterFastODataSource<any>;
  countriesDataSoruce: MatSelectFilterObservableDataSource<any>;

  //url: 'https://services.odata.org/Experimental/Northwind/Northwind.svc/Categories'}

  constructor(private readonly httpClient: HttpClient, fb: FormBuilder) {
    this.theForm = fb.group({
      ID: 17,
      cca3: 'URY',
    });

    this.productDataSource = new MatSelectFilterFastODataSource<any>(
      this.httpClient,
      'https://services.odata.org/Experimental/Northwind/Northwind.svc/Products',
      0,
      true,
      ['ProductName', 'QuantityPerUnit'],
      'ProductID'
    );
    // le agrega un order by y acota los campso seleccionados
    //this.productDataSource.orderBy = ['ProductName'];
    //this.productDataSource.selectedFields = ['ProductID', 'ProductName'];

    this.productDataSource.selectedValueChanged
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        console.log('PRODUCT: ', val);
      });

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
  ngOnInit(): void {}
}
