import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-user-type',
  imports: [],
  templateUrl: './user-type.html',
  styleUrl: './user-type.css'
})
export class UserTypeComponent implements OnInit {

  selectedUserType: string = '';

  constructor(
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    // Clear all previous registration details so registration form starts completely empty
    this.registrationService.clearAllRegistrationDrafts();
    this.selectedUserType = '';
    localStorage.setItem('SellerFurthestStep', '1');
  }

  selectUserType(type: string): void {

    this.selectedUserType = type;
    localStorage.setItem('selectedUserType', type);
    console.log('Selected User Type:', type);

  }

  back(): void {

    this.router.navigate(['/registration']);

  }

  next(): void {

    if (!this.selectedUserType) {

      alert('Please select a user type');

      return;

    }

    this.router.navigate(['/personal-details']);

  }


  goToStep(step: number): void {
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (step <= furthest) {
      const stepRoutes = [
        '/user-type',
        '/personal-details',
        '/address-details',
        '/land-survey-details',
        '/plantation-details',
        '/carbon-calculator',
        '/consent',
        '/preview',
        '/seller/dashboard'
      ];
      this.router.navigate([stepRoutes[step - 1]]);
    }
  }
}
