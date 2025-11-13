import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { LocationFilterComponent } from './location-filter.component';

@NgModule({
  declarations: [LocationFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  exports: [LocationFilterComponent]
})
export class LocationFilterModule { }

