import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { UniversityPageRoutingModule } from './university-routing.module';

import { UniversityPage } from './university.page';
import {LoadingModalModule} from "../../../../components/loading-modal/loading-modal.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        // UniversityPageRoutingModule,
        LoadingModalModule
    ],
  declarations: [UniversityPage]
})
export class UniversityPageModule {}
