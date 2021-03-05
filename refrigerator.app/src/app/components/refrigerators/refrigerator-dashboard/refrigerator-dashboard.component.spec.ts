import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefrigeratorDashboardComponent } from './refrigerator-dashboard.component';

describe('RefrigeratorDashboardComponent', () => {
  let component: RefrigeratorDashboardComponent;
  let fixture: ComponentFixture<RefrigeratorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefrigeratorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefrigeratorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
