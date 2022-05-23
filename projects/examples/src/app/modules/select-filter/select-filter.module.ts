import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { SelectFilterRoutingModule } from './select-filter-routing.module';
import { SelectFilterComponent } from './select-filter.component';
import {
  MatSelectFilterModule,
  MatSelectInfiniteScrollModule,
} from 'projects/ngx-mat-extras/src/public-api';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [SelectFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectFilterRoutingModule,
    HttpClientModule,
    MatSelectFilterModule,
    MatSelectInfiniteScrollModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatPaginatorModule,
  ],
})
export class SelectFilterModule {}
