import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompanyRequestDashboardPageRoutingModule } from './company-request-dashboard-routing.module';

import { CompanyRequestDashboardPage } from './company-request-dashboard.page';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { RequestListingModule } from 'src/app/components/request-listing/request-listing.module';
import {StoryItemModule} from 'src/app/components/story-item/story-item.module';
import { RequestFilterComponent } from 'src/app/components/request-filter/request-filter.component';
import { StoryFilterComponent } from 'src/app/components/story-filter/story-filter.component';
import {NoItemsModule} from 'src/app/components/no-items/no-items.module';
import {DatePopupModule} from "../../../../components/date-popup/date-popup.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoadingModalModule,
        PipesModule,
        RequestListingModule,
        StoryItemModule,
        NoItemsModule,
        CompanyRequestDashboardPageRoutingModule,
        DatePopupModule
    ],
  declarations: [
    CompanyRequestDashboardPage,
    RequestFilterComponent,
    StoryFilterComponent
  ]
})
export class CompanyRequestDashboardPageModule {}
