import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyRegistrationRequestListPageRoutingModule } from './company-registration-request-list-routing.module';

import { CompanyRegistrationRequestListPage } from './company-registration-request-list.page';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    LoadingModalModule,
    CommonModule,
    FormsModule,
    IonicModule,
    CompanyRegistrationRequestListPageRoutingModule
  ],
  declarations: [CompanyRegistrationRequestListPage]
})
export class CompanyRegistrationRequestListPageModule {}
