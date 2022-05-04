import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OdataSourceComponent } from './odata-source.component';

describe('OdataSourceComponent', () => {
  let component: OdataSourceComponent;
  let fixture: ComponentFixture<OdataSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OdataSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OdataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
