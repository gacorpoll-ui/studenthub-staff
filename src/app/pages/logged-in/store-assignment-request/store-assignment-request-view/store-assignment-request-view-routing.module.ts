import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreAssignmentRequestViewPage } from './store-assignment-request-view.page';

const routes: Routes = [
  {
    path: '',
    component: StoreAssignmentRequestViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreAssignmentRequestViewPageRoutingModule {}
