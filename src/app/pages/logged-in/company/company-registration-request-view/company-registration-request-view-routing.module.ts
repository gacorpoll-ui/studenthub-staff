import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyRegistrationRequestViewPage } from './company-registration-request-view.page';

const routes: Routes = [
  {
    path: ':id',
    component: CompanyRegistrationRequestViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRegistrationRequestViewPageRoutingModule {}
