import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FulltimerSuggestionsPageRoutingModule } from './fulltimer-suggestions-routing.module';

import { FulltimerSuggestionsPage } from './fulltimer-suggestions.page';
import { NoteModule } from 'src/app/components/note/note.module';
import { LoadingModalModule } from 'src/app/components/loading-modal/loading-modal.module';
import { SuggestionModule } from "../../../../components/suggestion/suggestion.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoteModule,
    LoadingModalModule,
    FulltimerSuggestionsPageRoutingModule,
    SuggestionModule
  ],
  declarations: [FulltimerSuggestionsPage]
})
export class FulltimerSuggestionsPageModule { }
