import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { AgeRefinementListComponent } from './age-refinement-list.component';

@NgModule({
  declarations: [
    AgeRefinementListComponent
  ],
  imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      PipesModule,
      NgxSliderModule,
  ],
  exports: [
      AgeRefinementListComponent
  ]
})
export class AgeRefinementListModule { }
