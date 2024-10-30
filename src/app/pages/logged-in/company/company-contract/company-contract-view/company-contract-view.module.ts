import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyContractViewPageRoutingModule } from './company-contract-view-routing.module';

import { CompanyContractViewPage } from './company-contract-view.page';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoItemsModule,
    CompanyContractViewPageRoutingModule
  ],
  declarations: [CompanyContractViewPage]
})
export class CompanyContractViewPageModule {}
