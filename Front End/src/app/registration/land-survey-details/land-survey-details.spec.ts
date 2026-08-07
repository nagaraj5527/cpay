import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandSurveyDetails } from './land-survey-details';

describe('LandSurveyDetails', () => {
  let component: LandSurveyDetails;
  let fixture: ComponentFixture<LandSurveyDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandSurveyDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LandSurveyDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
