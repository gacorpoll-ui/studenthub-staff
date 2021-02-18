import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BankListPageRoutingModule } from './bank-list-routing.module';

import { BankListPage } from './bank-list.page';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingModalModule,
    BankListPageRoutingModule
  ],
  declarations: [BankListPage]
})
export class BankListPageModule {}
