import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-type',
  imports: [],
  templateUrl: './user-type.html',
  styleUrl: './user-type.css'
})
export class UserTypeComponent {

  selectedUserType: string = '';

  constructor(
    private router: Router
  ) {
    const currentStep = 1;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
    this.selectedUserType = localStorage.getItem('selectedUserType') || '';
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
