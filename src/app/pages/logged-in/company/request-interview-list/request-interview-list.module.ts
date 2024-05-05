import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestInterviewListPageRoutingModule } from './request-interview-list-routing.module';

import { RequestInterviewListPage } from './request-interview-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { CandidateModule } from 'src/app/components/candidate/candidate.module';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';
import { NoItemsModule } from 'src/app/components/no-items/no-items.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingModalModule,
    NoItemsModule,
    CandidateModule,
    TranslateModule.forChild(),
    RequestInterviewListPageRoutingModule
  ],
  declarations: [RequestInterviewListPage]
})
export class RequestInterviewListPageModule {}
