import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BrandFormPageRoutingModule } from './brand-form-routing.module';

import { BrandFormPage } from './brand-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    BrandFormPageRoutingModule
  ],
  declarations: [BrandFormPage]
})
export class BrandFormPageModule {}
