import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestInterviewListPage } from './request-interview-list.page';

const routes: Routes = [
  {
    path: '',
    component: RequestInterviewListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestInterviewListPageRoutingModule {}
