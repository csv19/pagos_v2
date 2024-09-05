import { TestBed } from '@angular/core/testing';

import { AuthTaxeService } from './auth-taxe.service';

describe('AuthTaxeService', () => {
  let service: AuthTaxeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTaxeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
