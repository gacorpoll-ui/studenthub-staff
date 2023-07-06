import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyCandidatesPageRoutingModule } from './company-candidates-routing.module';

import { CompanyCandidatesPage } from './company-candidates.page';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';
import { CandidateModule } from 'src/app/components/candidate/candidate.module';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoItemsModule,
    CandidateModule,
    LoadingModalModule,
    CompanyCandidatesPageRoutingModule
  ],
  declarations: [CompanyCandidatesPage]
})
export class CompanyCandidatesPageModule {}
