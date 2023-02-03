import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpenseViewPageRoutingModule } from './expense-view-routing.module';

import { ExpenseViewPage } from './expense-view.page';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingModalModule,
    ExpenseViewPageRoutingModule
  ],
  declarations: [ExpenseViewPage]
})
export class ExpenseViewPageModule {}
