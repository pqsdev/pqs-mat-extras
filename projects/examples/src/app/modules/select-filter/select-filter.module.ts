import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { SelectFilterRoutingModule } from './select-filter-routing.module';
import { SelectFilterComponent } from './select-filter.component';
import {
  MatSelectFilterModule,
  MatSelectInfiniteScrollModule,
} from 'projects/ngx-mat-extras/src/public-api';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

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
