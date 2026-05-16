import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { RangeRefinementComponent } from './range-refinement-list';

import { PipesModule } from '../../pipes/pipes.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';


@NgModule({
    declarations: [
        RangeRefinementComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PipesModule,
        NgxSliderModule,
    ],
    exports: [
        RangeRefinementComponent
    ]
})
export class RangeRefinementModule { }
