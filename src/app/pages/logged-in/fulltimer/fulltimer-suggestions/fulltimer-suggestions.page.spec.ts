import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FulltimerSuggestionsPage } from './fulltimer-suggestions.page';

describe('FulltimerSuggestionsPage', () => {
  let component: FulltimerSuggestionsPage;
  let fixture: ComponentFixture<FulltimerSuggestionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FulltimerSuggestionsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FulltimerSuggestionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
