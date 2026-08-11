import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../components/custom-select/custom-select';

import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-land-survey-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './land-survey-details.html',
  styleUrl: './land-survey-details.css'
})
export class LandSurveyDetailsComponent implements OnInit, OnDestroy {

  @ViewChild('cameraInput')
  cameraInput!: ElementRef<HTMLInputElement>;

  latitude: number | null = null;
  longitude: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isCameraActive: boolean = false;
  capturedTimestamp: string = '';

  surveyNo: string = '';
  subDivisionNo: string = '';
  area: string = '';
  unit: string = '';

  pattadarDoc: string = '';
  pattadarDocName: string = '';
  pattadarDocPreview: string | ArrayBuffer | null = null;

  private cameraStream: MediaStream | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private registrationService: RegistrationService
  ) {
    const currentStep = 4;
    const storedFurthest = localStorage.getItem('SellerFurthestStep');
    const furthest = storedFurthest ? parseInt(storedFurthest, 10) : 1;
    if (currentStep > furthest) {
      localStorage.setItem('SellerFurthestStep', currentStep.toString());
    }
  }

  ngOnInit(): void {
    const ld = this.registrationService.getDraftData('SellerLandDetails');
    if (ld) {
      this.surveyNo = ld.surveyNo || '';
      this.subDivisionNo = ld.subDivisionNo || '';
      this.area = ld.area || '';
      this.unit = ld.unit || '';
      this.latitude = ld.latitude || 17.492677;
      this.longitude = ld.longitude || 78.402428;
      this.imagePreview = ld.imagePreview || null;
      this.capturedTimestamp = ld.capturedTimestamp || '';
      this.pattadarDoc = ld.pattadarDoc || '';
      this.pattadarDocName = ld.pattadarDocName || '';
      this.pattadarDocPreview = ld.pattadarDocPreview || ld.pattadarDoc || null;
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  isPattadarDragging: boolean = false;

  onPattadarDocSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processPattadarFile(input.files[0]);
  }

  onPattadarDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPattadarDragging = true;
  }

  onPattadarDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPattadarDragging = false;
  }

  onPattadarDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPattadarDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processPattadarFile(event.dataTransfer.files[0]);
    }
  }

  private processPattadarFile(file: File): void {
    this.pattadarDocName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.pattadarDoc = reader.result as string;
      this.pattadarDocPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removePattadarDoc(): void {
    this.pattadarDoc = '';
    this.pattadarDocName = '';
    this.pattadarDocPreview = null;
  }

  back(): void {
    this.stopCamera();
    this.router.navigate(
      ['/address-details']
    );
  }

  next(): void {
    if (!this.surveyNo) {
      alert('Please enter survey number');
      return;
    }
    if (!this.subDivisionNo) {
      alert('Please enter sub division number');
      return;
    }
    if (!this.area) {
      alert('Please enter total area');
      return;
    }
    if (!this.unit) {
      alert('Please select unit');
      return;
    }
    if (!this.pattadarDocName) {
      alert('Please upload Land Pattadar Passbook / Adangal Document.');
      return;
    }
    if (!this.imagePreview) {
      alert('Please capture or upload a land photograph before proceeding.');
      return;
    }

    const landPayload = {
      surveyNo: this.surveyNo,
      subDivisionNo: this.subDivisionNo,
      area: this.area,
      unit: this.unit,
      latitude: this.latitude,
      longitude: this.longitude,
      imagePreview: this.imagePreview,
      capturedTimestamp: this.capturedTimestamp,
      pattadarDoc: this.pattadarDoc || this.pattadarDocPreview || this.pattadarDocName,
      pattadarDocName: this.pattadarDocName,
      pattadarDocPreview: this.pattadarDocPreview || this.pattadarDoc || this.pattadarDocName
    };

    const currentMob = localStorage.getItem('currentUserMobile') || '';
    this.registrationService.setDraftData('SellerLandDetails', landPayload, currentMob);

    this.stopCamera();
    this.router.navigate(['/plantation-details']);
  }

  async capturePhoto(): Promise<void> {
    this.imagePreview = null;
    this.isCameraActive = true;

    // Fetch GPS coordinates in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
        },
        () => {
          if (!this.latitude) this.latitude = 17.492677;
          if (!this.longitude) this.longitude = 78.402428;
        },
        { timeout: 3000 }
      );
    } else {
      if (!this.latitude) this.latitude = 17.492677;
      if (!this.longitude) this.longitude = 78.402428;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      setTimeout(() => {
        const video = document.getElementById('cameraVideo') as HTMLVideoElement;
        if (video) {
          video.srcObject = this.cameraStream;
        }
      }, 50);
    } catch (error) {
      console.error(error);
      this.isCameraActive = false;
      alert('Could not access live camera. Please check camera permissions or upload a photograph from gallery.');
    }
  }

  retakePhoto(): void {
    this.imagePreview = null;
    this.capturePhoto();
  }

  takeSnapshot(): void {
    const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    const canvas = document.getElementById('snapshotCanvas') as HTMLCanvasElement;

    if (!video || !canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    this.capturedTimestamp = now.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    if (!this.latitude || !this.longitude) {
      this.latitude = 17.492677;
      this.longitude = 78.402428;
    }

    const latStr = this.latitude.toFixed(6);
    const lngStr = this.longitude.toFixed(6);

    const bannerHeight = Math.max(54, Math.floor(canvas.height * 0.14));
    const bannerY = canvas.height - bannerHeight;

    context.fillStyle = 'rgba(15, 23, 42, 0.88)';
    context.fillRect(0, bannerY, canvas.width, bannerHeight);

    context.fillStyle = '#00a499';
    context.fillRect(0, bannerY, 6, bannerHeight);

    const font1Size = Math.max(14, Math.floor(bannerHeight * 0.28));
    context.font = `bold ${font1Size}px sans-serif`;
    context.fillStyle = '#ffffff';
    context.fillText(`📍 Latitude: ${latStr} | Longitude: ${lngStr}`, 16, bannerY + font1Size + 6);

    const font2Size = Math.max(11, Math.floor(bannerHeight * 0.22));
    context.font = `${font2Size}px sans-serif`;
    context.fillStyle = '#cbd5e1';
    context.fillText(`📅 ${this.capturedTimestamp} • C-PAY Land Verification`, 16, bannerY + font1Size + font2Size + 12);

    this.imagePreview = canvas.toDataURL('image/jpeg', 0.6);
    this.stopCamera();
    this.cdr.detectChanges();
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.isCameraActive = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        const context = canvas.getContext('2d');

        if (!this.latitude || !this.longitude) {
          this.latitude = 17.492677;
          this.longitude = 78.402428;
        }

        const now = new Date();
        this.capturedTimestamp = now.toLocaleString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        if (context) {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);

          const latStr = this.latitude.toFixed(6);
          const lngStr = this.longitude.toFixed(6);

          const bannerHeight = Math.max(54, Math.floor(canvas.height * 0.14));
          const bannerY = canvas.height - bannerHeight;

          context.fillStyle = 'rgba(15, 23, 42, 0.88)';
          context.fillRect(0, bannerY, canvas.width, bannerHeight);

          context.fillStyle = '#00a499';
          context.fillRect(0, bannerY, 6, bannerHeight);

          const font1Size = Math.max(14, Math.floor(bannerHeight * 0.28));
          context.font = `bold ${font1Size}px sans-serif`;
          context.fillStyle = '#ffffff';
          context.fillText(`📍 Latitude: ${latStr} | Longitude: ${lngStr}`, 16, bannerY + font1Size + 6);

          const font2Size = Math.max(11, Math.floor(bannerHeight * 0.22));
          context.font = `${font2Size}px sans-serif`;
          context.fillStyle = '#cbd5e1';
          context.fillText(`📅 ${this.capturedTimestamp} • C-PAY Land Verification`, 16, bannerY + font1Size + font2Size + 12);

          this.imagePreview = canvas.toDataURL('image/jpeg', 0.6);
        } else {
          this.imagePreview = reader.result;
        }
        this.stopCamera();
        this.cdr.detectChanges();
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);

    if (navigator.geolocation && (!this.latitude || !this.longitude)) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
          this.cdr.detectChanges();
        },
        () => {
          if (!this.latitude) this.latitude = 17.492677;
          if (!this.longitude) this.longitude = 78.402428;
          this.cdr.detectChanges();
        },
        { timeout: 3000 }
      );
    } else if (!this.latitude || !this.longitude) {
      this.latitude = 17.492677;
      this.longitude = 78.402428;
      this.cdr.detectChanges();
    }
  }

  triggerGalleryUpload(): void {
    const el = (this.cameraInput && this.cameraInput.nativeElement)
      ? this.cameraInput.nativeElement
      : (document.getElementById('globalGalleryInput') as HTMLInputElement);

    if (el) {
      el.value = '';
      el.click();
    }
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
      this.stopCamera();
      this.router.navigate([stepRoutes[step - 1]]);
    }
  }
}
