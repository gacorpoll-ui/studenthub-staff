import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CompanyRegistrationRequestListPage } from './company-registration-request-list.page';

describe('CompanyRegistrationRequestListPage', () => {
  let component: CompanyRegistrationRequestListPage;
  let fixture: ComponentFixture<CompanyRegistrationRequestListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyRegistrationRequestListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyRegistrationRequestListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
