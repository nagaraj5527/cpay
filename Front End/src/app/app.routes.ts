import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { SellerLogin } from './components/seller-login/seller-login';

import { SellerDashboard } from './components/seller-dashboard/seller-dashboard';
import { BuyerDashboard } from './components/buyer-dashboard/buyer-dashboard';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { ValuatorRegistrationComponent } from './components/valuator-registration/valuator-registration';
import { ValuatorDashboardComponent } from './components/valuator-dashboard/valuator-dashboard';
import { LoginGateway } from './components/login-gateway/login-gateway';


// Seller Registration Components
import { RegistrationWizardComponent } from './registration/registration-wizard/registration-wizard';
import { UserTypeComponent } from './registration/user-type/user-type';
import { PersonalDetailsComponent } from './registration/personal-details/personal-details';
import { AddressDetailsComponent } from './registration/address-details/address-details';
import { LandSurveyDetailsComponent } from './registration/land-survey-details/land-survey-details';
import { PlantationDetailsComponent } from './registration/plantation-details/plantation-details';
import { CarbonCalculatorComponent } from './registration/carbon-calculator/carbon-calculator';
import { ConsentComponent } from './registration/consent/consent';
import { PreviewComponent } from './registration/preview/preview';
// import { SubmitComponent } from './registration/submit/submit';

// Buyer Registration Component
import { BuyerRegistrationComponent } from './buyer-registration/buyer-registration';

export const routes: Routes = [
  { path: '', component: LandingPage, pathMatch: 'full' },
  { path: 'seller/dashboard', component: SellerDashboard },
  { path: 'buyer/dashboard', component: BuyerDashboard },
  { path: 'admin/dashboard', component: AdminDashboard },
  { path: 'valuator/dashboard', component: ValuatorDashboardComponent },
  { path: 'valuator/register', component: ValuatorRegistrationComponent },
  
  // Registration routes
  { path: 'registration', component: RegistrationWizardComponent },
  { path: 'user-type', component: UserTypeComponent },
  { path: 'personal-details', component: PersonalDetailsComponent },
  { path: 'address-details', component: AddressDetailsComponent },
  { path: 'land-survey-details', component: LandSurveyDetailsComponent },
  { path: 'plantation-details', component: PlantationDetailsComponent },
  { path: 'carbon-calculator', component: CarbonCalculatorComponent },
  { path: 'consent', component: ConsentComponent },
  { path: 'preview', component: PreviewComponent },
  // { path: 'submit', component: SubmitComponent },
  { path: 'buyer-registration', component: BuyerRegistrationComponent },

  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginGateway },
      { path: 'login/seller-buyer', component: SellerLogin },
      { path: 'login/valuator', component: SellerLogin },
      { path: 'login/Seller', redirectTo: 'login/seller-buyer', pathMatch: 'full' },
      { path: 'login/admin', component: AdminLogin }
    ]
  },
  { path: '**', redirectTo: '' }
];


