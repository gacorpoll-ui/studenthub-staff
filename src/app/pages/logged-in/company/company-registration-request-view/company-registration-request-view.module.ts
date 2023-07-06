import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyRegistrationRequestViewPageRoutingModule } from './company-registration-request-view-routing.module';

import { CompanyRegistrationRequestViewPage } from './company-registration-request-view.page';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    LoadingModalModule,
    CommonModule,
    FormsModule,
    IonicModule,
    CompanyRegistrationRequestViewPageRoutingModule
  ],
  declarations: [CompanyRegistrationRequestViewPage]
})
export class CompanyRegistrationRequestViewPageModule {}
