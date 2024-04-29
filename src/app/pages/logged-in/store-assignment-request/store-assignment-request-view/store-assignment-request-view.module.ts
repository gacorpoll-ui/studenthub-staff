import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreAssignmentRequestViewPageRoutingModule } from './store-assignment-request-view-routing.module';

import { StoreAssignmentRequestViewPage } from './store-assignment-request-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreAssignmentRequestViewPageRoutingModule
  ],
  declarations: [StoreAssignmentRequestViewPage]
})
export class StoreAssignmentRequestViewPageModule {}
