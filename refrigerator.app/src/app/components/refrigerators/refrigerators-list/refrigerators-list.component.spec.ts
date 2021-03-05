import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefrigeratorsListComponent } from './refrigerators-list.component';

describe('RefrigeratorsListComponent', () => {
  let component: RefrigeratorsListComponent;
  let fixture: ComponentFixture<RefrigeratorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefrigeratorsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefrigeratorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
