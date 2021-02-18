import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BankListPage } from './bank-list.page';

describe('BankListPage', () => {
  let component: BankListPage;
  let fixture: ComponentFixture<BankListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BankListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
