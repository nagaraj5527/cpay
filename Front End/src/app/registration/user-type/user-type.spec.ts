import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserType } from './user-type';

describe('UserType', () => {
  let component: UserType;
  let fixture: ComponentFixture<UserType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserType],
    }).compileComponents();

    fixture = TestBed.createComponent(UserType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
