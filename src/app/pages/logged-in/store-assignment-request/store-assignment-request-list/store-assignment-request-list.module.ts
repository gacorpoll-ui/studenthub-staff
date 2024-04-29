import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreAssignmentRequestListPageRoutingModule } from './store-assignment-request-list-routing.module';

import { StoreAssignmentRequestListPage } from './store-assignment-request-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreAssignmentRequestListPageRoutingModule
  ],
  declarations: [StoreAssignmentRequestListPage]
})
export class StoreAssignmentRequestListPageModule {}
