import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyContractFormPage } from './company-contract-form.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyContractFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyContractFormPageRoutingModule {}
