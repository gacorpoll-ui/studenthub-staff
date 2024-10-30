import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyContractListPage } from './company-contract-list.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyContractListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyContractListPageRoutingModule {}
