import { TestBed } from '@angular/core/testing';

import { CompanyRegistrationRequestService } from './company-registration-request.service';

describe('CompanyRegistrationRequestService', () => {
  let service: CompanyRegistrationRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyRegistrationRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
