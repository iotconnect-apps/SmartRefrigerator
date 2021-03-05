import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRefrigeratorComponent } from './add-refrigerator.component';

describe('AddRefrigeratorComponent', () => {
  let component: AddRefrigeratorComponent;
  let fixture: ComponentFixture<AddRefrigeratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRefrigeratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRefrigeratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
