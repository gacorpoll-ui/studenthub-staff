import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BankListPage } from './bank-list.page';

const routes: Routes = [
  {
    path: '',
    component: BankListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankListPageRoutingModule {}
