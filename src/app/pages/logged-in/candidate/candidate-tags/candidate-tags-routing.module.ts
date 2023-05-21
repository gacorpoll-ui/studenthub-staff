import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CandidateTagsPage } from './candidate-tags.page';

const routes: Routes = [
  {
    path: '',
    component: CandidateTagsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateTagsPageRoutingModule {}
