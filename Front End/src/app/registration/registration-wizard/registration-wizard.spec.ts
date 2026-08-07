import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationWizard } from './registration-wizard';

describe('RegistrationWizard', () => {
  let component: RegistrationWizard;
  let fixture: ComponentFixture<RegistrationWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
