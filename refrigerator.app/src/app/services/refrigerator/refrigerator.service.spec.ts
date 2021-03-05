import { TestBed } from '@angular/core/testing';

import { RefrigeratorService } from './refrigerator.service';

describe('RefrigeratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RefrigeratorService = TestBed.get(RefrigeratorService);
    expect(service).toBeTruthy();
  });
});
