import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OdataSourceRoutingModule } from './odata-source-routing.module';
import { OdataSourceComponent } from './odata-source.component';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [OdataSourceComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,

    OdataSourceRoutingModule,
  ],
})
export class OdataSourceModule {}
