import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonCalculator } from './carbon-calculator';

describe('CarbonCalculator', () => {
  let component: CarbonCalculator;
  let fixture: ComponentFixture<CarbonCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarbonCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(CarbonCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
