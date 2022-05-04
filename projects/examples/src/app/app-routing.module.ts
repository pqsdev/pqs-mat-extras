import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  { path: 'odata-source', loadChildren: () => import('./modules/odata-source/odata-source.module').then(m => m.OdataSourceModule) },
  { path: 'select-filter', loadChildren: () => import('./modules/select-filter/select-filter.module').then(m => m.SelectFilterModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
