import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FulltimerSuggestionsPage } from './fulltimer-suggestions.page';

const routes: Routes = [
  {
    path: ':id',
    component: FulltimerSuggestionsPage
  },
  {
    path: ':id/:status',
    component: FulltimerSuggestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FulltimerSuggestionsPageRoutingModule {}
