import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyContractListPageRoutingModule } from './company-contract-list-routing.module';

import { CompanyContractListPage } from './company-contract-list.page';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';
import { CompanyContractFormPageModule } from '../company-contract-form/company-contract-form.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    CompanyContractFormPageModule,
    CompanyContractListPageRoutingModule,
    NoItemsModule,
    LoadingModalModule,
  ],
  declarations: [CompanyContractListPage]
})
export class CompanyContractListPageModule {}
