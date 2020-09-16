import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BrandFormPage } from './brand-form.page';

describe('BrandFormPage', () => {
  let component: BrandFormPage;
  let fixture: ComponentFixture<BrandFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
