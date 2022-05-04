import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OdataSourceComponent } from './odata-source.component';

const routes: Routes = [{ path: '', component: OdataSourceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OdataSourceRoutingModule { }
