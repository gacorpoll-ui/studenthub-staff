import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpenseListPageRoutingModule } from './expense-list-routing.module';

import { ExpenseListPage } from './expense-list.page';
import {LoadingModalModule} from "src/app/components/loading-modal/loading-modal.module";
import {NoItemsModule} from "src/app/components/no-items/no-items.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NoItemsModule,
    IonicModule,
    ExpenseListPageRoutingModule,
    LoadingModalModule
  ],
  declarations: [ExpenseListPage]
})
export class ExpenseListPageModule {}
