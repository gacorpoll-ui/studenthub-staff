import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CompanyRegistrationRequestViewPage } from './company-registration-request-view.page';

describe('CompanyRegistrationRequestViewPage', () => {
  let component: CompanyRegistrationRequestViewPage;
  let fixture: ComponentFixture<CompanyRegistrationRequestViewPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyRegistrationRequestViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyRegistrationRequestViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
