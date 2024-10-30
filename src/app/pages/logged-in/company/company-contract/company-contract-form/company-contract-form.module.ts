import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyContractFormPageRoutingModule } from './company-contract-form-routing.module';

import { CompanyContractFormPage } from './company-contract-form.page';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NoItemsModule,
    CompanyContractFormPageRoutingModule
  ],
  declarations: [CompanyContractFormPage]
})
export class CompanyContractFormPageModule {}
