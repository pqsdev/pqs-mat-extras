import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectFilterComponent } from './select-filter.component';

const routes: Routes = [{ path: '', component: SelectFilterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectFilterRoutingModule { }
