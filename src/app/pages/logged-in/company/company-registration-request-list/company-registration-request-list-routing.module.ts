import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyRegistrationRequestListPage } from './company-registration-request-list.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyRegistrationRequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRegistrationRequestListPageRoutingModule {}
