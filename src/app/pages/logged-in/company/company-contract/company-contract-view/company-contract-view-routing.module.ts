import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyContractViewPage } from './company-contract-view.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyContractViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyContractViewPageRoutingModule {}
