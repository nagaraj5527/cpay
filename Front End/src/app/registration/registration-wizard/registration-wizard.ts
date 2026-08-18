import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDatabaseService } from '../../services/mock-db.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-registration-wizard',
  imports: [CommonModule, RouterLink],
  templateUrl: './registration-wizard.html',
  styleUrl: './registration-wizard.css'
})
export class RegistrationWizardComponent implements OnInit {
  selectedRole: string = '';
  loggedInRole: 'seller' | 'buyer' | '' = '';

  constructor(
    private router: Router,
    private dbService: MockDatabaseService,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    // Clear all previous draft registration inputs when starting fresh
    this.registrationService.clearAllRegistrationDrafts();

    const mobile = localStorage.getItem('currentUserMobile');
    if (mobile) {
      const user = this.dbService.getUser(mobile);
      if (user) {
        if (user.userRole === 'Seller') {
          this.loggedInRole = 'seller';
        } else if (user.userRole === 'buyer') {
          this.loggedInRole = 'buyer';
        }
      }
    }
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  startRegistration() {
    this.registrationService.clearAllRegistrationDrafts();
    if (this.selectedRole === 'seller') {
      this.router.navigate(['/user-type']);
    } else if (this.selectedRole === 'buyer') {
      this.router.navigate(['/buyer-registration']);
    } else if (this.selectedRole === 'valuator') {
      this.router.navigate(['/valuator/register']);
    }
  }

  goBackToLanding(): void {
    this.router.navigate(['/']);
  }

  skipRegistration() {
    this.router.navigate([
      '/user-type'
    ]);
  }
}
