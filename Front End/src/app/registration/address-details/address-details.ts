import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PincodeService } from '../../services/pincode.service';
import { CustomSelectComponent } from '../../components/custom-select/custom-select';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-address-details',
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './address-details.html',
  styleUrl: './address-details.css'
})
export class AddressDetailsComponent implements OnInit {
  pincode: string = '';
  state: string = '';
  district: string = '';
  mandal: string = '';
  village: string = '';

  // Options lists
  statesList: string[] = [];
  districtsList: string[] = [];
  mandalsList: string[] = [];
  villagesList: string[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private pincodeService: PincodeService,
    private registrationService: RegistrationService
  ) {
    const currentStep = 3;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    const address = this.registrationService.getDraftData('SellerAddressDetails');
    if (address) {
      this.pincode = address.pincode || '';
      this.state = address.state || '';
      this.district = address.district || '';
      this.mandal = address.mandal || '';
      this.village = address.village || '';
      
      if (this.pincode) {
        if (this.state) this.statesList = [this.state];
        if (this.district) this.districtsList = [this.district];
        if (this.mandal) this.mandalsList = [this.mandal];
        if (this.village) this.villagesList = [this.village];
      }
    }
  }

  onPincodeChange(): void {
    if (this.pincode && this.pincode.length === 6) {
      this.fetchAddressDetails();
    } else {
      this.errorMessage = '';
    }
  }

  fetchAddressDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Call the Pincode Service (local-first cache / memory / API fallback)
    this.pincodeService.fetchPincode(this.pincode)
      .then(data => {
        this.isLoading = false;
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffices = data[0].PostOffice;
          if (postOffices && postOffices.length > 0) {
            // Take the first post office details to auto-populate State and District
            const firstOffice = postOffices[0];
            
            this.state = firstOffice.State;
            this.district = firstOffice.District;
            
            // mandal usually corresponds to Taluk or Block
            this.mandal = firstOffice.Taluk && firstOffice.Taluk !== 'NA' ? firstOffice.Taluk : firstOffice.Block;
            
            // Build the options lists
            this.statesList = Array.from(new Set(postOffices.map((po: any) => po.State).filter(Boolean))) as string[];
            this.districtsList = Array.from(new Set(postOffices.map((po: any) => po.District).filter(Boolean))) as string[];
            this.mandalsList = Array.from(new Set(postOffices.map((po: any) => po.Taluk && po.Taluk !== 'NA' ? po.Taluk : po.Block).filter(Boolean))) as string[];
            this.villagesList = Array.from(new Set(postOffices.map((po: any) => po.Name).filter(Boolean))) as string[];
            
            // If the current selections are not in the new lists, select the first option
            if (!this.statesList.includes(this.state)) this.state = this.statesList[0] || '';
            if (!this.districtsList.includes(this.district)) this.district = this.districtsList[0] || '';
            if (!this.mandalsList.includes(this.mandal)) this.mandal = this.mandalsList[0] || '';
            
            // Village is a dropdown containing all PostOffice Names in that pincode
            if (this.villagesList.length > 0) {
              this.village = this.villagesList[0];
            } else {
              this.village = '';
            }
          } else {
            this.errorMessage = 'No office details found for this pincode.';
            this.clearAddressFields();
          }
        } else {
          this.errorMessage = 'Invalid Pincode. Please check and try again.';
          this.clearAddressFields();
        }
      })
      .catch(err => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching details from PIN Code API.';
        console.error(err);
        this.clearAddressFields();
      });
  }

  clearAddressFields(): void {
    this.state = '';
    this.district = '';
    this.mandal = '';
    this.village = '';
    this.statesList = [];
    this.districtsList = [];
    this.mandalsList = [];
    this.villagesList = [];
  }

  back() {
    this.router.navigate(['/personal-details']);
  }

  next() {
    this.registrationService.setDraftData('SellerAddressDetails', {
      pincode: this.pincode,
      state: this.state,
      district: this.district,
      mandal: this.mandal,
      village: this.village
    });
    this.router.navigate(['/land-survey-details']);
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
