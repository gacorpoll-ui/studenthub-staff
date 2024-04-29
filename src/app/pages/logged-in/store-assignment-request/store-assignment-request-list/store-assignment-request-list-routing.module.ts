import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreAssignmentRequestListPage } from './store-assignment-request-list.page';

const routes: Routes = [
  {
    path: '',
    component: StoreAssignmentRequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreAssignmentRequestListPageRoutingModule {}
