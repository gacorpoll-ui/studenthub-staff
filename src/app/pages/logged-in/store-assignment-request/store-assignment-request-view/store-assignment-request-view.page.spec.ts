import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreAssignmentRequestViewPage } from './store-assignment-request-view.page';

describe('StoreAssignmentRequestViewPage', () => {
  let component: StoreAssignmentRequestViewPage;
  let fixture: ComponentFixture<StoreAssignmentRequestViewPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreAssignmentRequestViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreAssignmentRequestViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
