import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyCandidatesPage } from './company-candidates.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyCandidatesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyCandidatesPageRoutingModule {}
