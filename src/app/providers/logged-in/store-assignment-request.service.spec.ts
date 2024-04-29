import { TestBed } from '@angular/core/testing';

import { StoreAssignmentRequestService } from './store-assignment-request.service';

describe('StoreAssignmentRequestService', () => {
  let service: StoreAssignmentRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreAssignmentRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
