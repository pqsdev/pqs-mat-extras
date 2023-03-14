import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  MatSelectModule } from '@angular/material/select';
import { MatSelectInfiniteScrollDirective } from './mat-select-infinite-scroll.directive';

@NgModule({
  declarations: [MatSelectInfiniteScrollDirective],
  imports: [CommonModule, MatSelectModule],
  exports: [MatSelectInfiniteScrollDirective],
})
export class MatSelectInfiniteScrollModule {}
