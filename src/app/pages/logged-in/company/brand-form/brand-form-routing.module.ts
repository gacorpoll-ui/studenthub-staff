import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrandFormPage } from './brand-form.page';

const routes: Routes = [
  {
    path: '',
    component: BrandFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrandFormPageRoutingModule {}
