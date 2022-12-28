import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSelectInfiniteScrollDirective } from './mat-select-infinite-scroll.directive';

@NgModule({
  declarations: [MatSelectInfiniteScrollDirective],
  imports: [CommonModule, MatSelectModule],
  exports: [MatSelectInfiniteScrollDirective],
})
export class MatSelectInfiniteScrollModule {}
