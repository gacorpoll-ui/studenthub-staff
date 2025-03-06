import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyContractViewPageRoutingModule } from './company-contract-view-routing.module';

import { CompanyContractViewPage } from './company-contract-view.page';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';
import { CandidateModule } from 'src/app/components/candidate/candidate.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CandidateModule,
    IonicModule,
    NoItemsModule,
    CompanyContractViewPageRoutingModule
  ],
  declarations: [CompanyContractViewPage]
})
export class CompanyContractViewPageModule {}
