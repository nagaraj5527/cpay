import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerRegistration } from './buyer-registration';

describe('BuyerRegistration', () => {
  let component: BuyerRegistration;
  let fixture: ComponentFixture<BuyerRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(BuyerRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
