import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RegistrationService } from '../../services/registration.service';
import { CustomSelectComponent } from '../custom-select/custom-select';

interface Holding {
  id: string;
  projectName: string;
  projectType: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  origin: string;
  registry: string;
}

interface Transaction {
  id: string;
  timestamp: string;
  type: 'BUY' | 'SELL' | 'RETIRE';
  projectName: string;
  quantity: number;
  price: number;
  total: number;
  status: 'COMPLETED' | 'PENDING';
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './buyer-dashboard.html',
  styleUrl: './buyer-dashboard.css'
})
export class BuyerDashboard implements OnInit, OnDestroy {
  accountTypeOptions: string[] = ['Savings Account', 'Current Account'];
  supportSubjectOptions: string[] = ['Select Subject Category', 'Land Audit Request', 'Biomass Counting Correction', 'Credit Trading Support', 'General Query'];
  supportSubject: string = 'Select Issue Category';

  get projectOptions(): string[] {
    const list = (this.holdings || []).map(h => h.projectName);
    const defaults = ['Godavari Mangrove Restoration', 'Nellore Solar Farm', 'Satara Agroforestry'];
    return Array.from(new Set([...list, ...defaults]));
  }
  // Account Information
  activeTab: string = 'Live Terminal';
  isSidebarCollapsed: boolean = false;
  searchQuery: string = '';
  showSearchDropdown: boolean = false;
  searchResults: Array<{ icon: string; title: string; subtitle: string; type: string; value: any }> = [];
  isSyncing: boolean = false;
  cashBalance: number = 245890.00;
  portfolioValue: number = 0;
  totalHoldingsQty: number = 0;
  retiredCredits: number = 2150;
  currentLanguage: string = 'en';
  hidePanNumber: boolean = true;
  hideAccountNumber: boolean = true;
  hideIfscCode: boolean = true;
  selectedUserType: string = '';
  certificateId: string = '';
  blockchainHash: string = '';
  issueDate: string = '';

  selectedCurrency: string = 'INR';

  currencies: { [key: string]: { symbol: string, rate: number } } = {
    'INR': { symbol: '₹', rate: 1.0 },
    'USD': { symbol: '$', rate: 0.012 },
    'BTC': { symbol: '₿', rate: 0.00000015 },
    'EUR': { symbol: '€', rate: 0.011 },
    'GBP': { symbol: '£', rate: 0.0094 },
    'JPY': { symbol: '¥', rate: 1.88 },
    'AUD': { symbol: 'A$', rate: 0.018 }
  };

  convertAmount(amountInINR: number): number {
    const currencyInfo = this.currencies[this.selectedCurrency];
    if (!currencyInfo) return amountInINR;
    return amountInINR * currencyInfo.rate;
  }

  getCurrencySymbol(): string {
    const currencyInfo = this.currencies[this.selectedCurrency];
    return currencyInfo ? currencyInfo.symbol : '₹';
  }

  getCurrencyColor(currency?: string): string {
    const cur = currency || this.selectedCurrency;
    const colors: { [key: string]: string } = {
      'INR': '#059669',
      'USD': '#2563eb',
      'BTC': '#f7931a',
      'EUR': '#003399',
      'GBP': '#7c3aed',
      'JPY': '#e11d48',
      'AUD': '#0d9488'
    };
    return colors[cur] || '#1e293b';
  }

  convertAmountToINR(amount: number): number {
    const currencyInfo = this.currencies[this.selectedCurrency];
    if (!currencyInfo) return amount;
    return amount / currencyInfo.rate;
  }

  onCurrencyChange(): void {
    const prevRate = this.currencies[this.previousCurrency].rate;
    const currentRate = this.currencies[this.selectedCurrency].rate;
    this.displayOrderPrice = (this.displayOrderPrice / prevRate) * currentRate;
    this.previousCurrency = this.selectedCurrency;
  }

  isCurrencyDropdownOpen: boolean = false;

  selectCurrency(cur: string): void {
    this.selectedCurrency = cur;
    this.isCurrencyDropdownOpen = false;
    this.onCurrencyChange();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  changeLanguage(event: any): void {
    const lang = event.target.value;
    this.currentLanguage = lang;
    
    if (lang === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "googtrans=/en/en; path=/;";
    } else {
      document.cookie = "googtrans=/en/" + lang + "; path=/;";
      document.cookie = "googtrans=/en/" + lang + "; path=/; domain=" + window.location.hostname;
    }
    
    window.location.reload();
  }
  
  // Market Ticker
  livePrice: number = 20.45;
  priceChange: number = 4.8;
  marketVolume24h: number = 452800;
  priceHistory: number[] = [19.20, 19.50, 19.40, 19.85, 20.10, 20.45];
  
  // Chart Configuration
  activeTimeframe: string = '1D';
  chartPoints: string = '10,90 30,75 50,80 70,60 90,45 110,35'; // SVG points for sparkline
  
  // Order Execution Form
  orderType: 'BUY' | 'SELL' = 'BUY';
  orderMode: 'MARKET' | 'LIMIT' = 'MARKET';
  orderQuantity: number | null = null;
  orderPrice: number = 20.45;
  displayOrderPrice: number = 20.45;
  previousCurrency: string = 'INR';
  selectedProject: string = 'Nellore Solar Farm';
  
  // Notifications
  errorMessage: string = '';
  successMessage: string = '';
  
  // Mock Data
  holdings: Holding[] = [
    {
      id: 'PRJ001',
      projectName: 'Nellore Solar Farm',
      projectType: 'Clean Energy',
      quantity: 4500,
      avgBuyPrice: 18.20,
      currentPrice: 20.45,
      origin: 'Nellore, Andhra Pradesh',
      registry: 'Verra (VCS)'
    },
    {
      id: 'PRJ002',
      projectName: 'Godavari Mangrove Restoration',
      projectType: 'Blue Carbon',
      quantity: 3200,
      avgBuyPrice: 24.00,
      currentPrice: 26.80,
      origin: 'East Godavari, Andhra Pradesh',
      registry: 'Gold Standard'
    },
    {
      id: 'PRJ003',
      projectName: 'Satara Agroforestry',
      projectType: 'Nature-based',
      quantity: 4594,
      avgBuyPrice: 15.50,
      currentPrice: 16.90,
      origin: 'Satara, Maharashtra',
      registry: 'CDM Registry'
    }
  ];

  transactions: Transaction[] = [
    {
      id: 'TXN8801',
      timestamp: 'Just now',
      type: 'BUY',
      projectName: 'Nellore Solar Farm',
      quantity: 500,
      price: 20.45,
      total: 10225.00,
      status: 'COMPLETED'
    },
    {
      id: 'TXN8754',
      timestamp: '2 hours ago',
      type: 'BUY',
      projectName: 'Satara Agroforestry',
      quantity: 1200,
      price: 16.85,
      total: 20220.00,
      status: 'COMPLETED'
    },
    {
      id: 'TXN8620',
      timestamp: '1 day ago',
      type: 'RETIRE',
      projectName: 'Godavari Mangrove Restoration',
      quantity: 250,
      price: 26.50,
      total: 6625.00,
      status: 'COMPLETED'
    }
  ];

  // Live Order Book Mock
  bids: OrderBookEntry[] = [];
  asks: OrderBookEntry[] = [];

  private priceUpdateInterval: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private registrationService: RegistrationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      const val = match[2];
      const parts = val.split('/');
      this.currentLanguage = parts[parts.length - 1] || 'en';
    } else {
      this.currentLanguage = 'en';
    }

    this.calculatePortfolioSummary();
    this.generateOrderBook();
    this.startLiveMarket();
    this.displayOrderPrice = this.convertAmount(this.orderPrice);

    const mobile = localStorage.getItem('currentUserMobile') || localStorage.getItem('loginMobile') || '';
    this.selectedUserType = localStorage.getItem('selectedUserType') || '';
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    this.certificateId = `CP-${cleanMobile}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    this.blockchainHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    this.issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const savedProfileStr = (mobile ? localStorage.getItem(`buyerProfileDetails_${mobile}`) : null) || localStorage.getItem('buyerProfileDetails');
    let parsedProfile: any = {};
    if (savedProfileStr) {
      try { parsedProfile = JSON.parse(savedProfileStr); } catch (e) {}
    }

    const bName = parsedProfile.buyerName || localStorage.getItem('buyerName') || '';
    const cName = parsedProfile.companyName || localStorage.getItem('companyName') || '';
    const bType = parsedProfile.selectedBuyerType || localStorage.getItem('selectedBuyerType') || localStorage.getItem('selectedUserType') || 'Organization / Corporate Buyer';
    const email = parsedProfile.emailAddress || parsedProfile.email || localStorage.getItem('emailAddress') || '';
    const mob = parsedProfile.mobileNumber || mobile || '';

    this.profileDetails = {
      buyerName: bName,
      companyName: cName,
      selectedBuyerType: bType,
      emailAddress: email,
      mobileNumber: mob,
      panNumber: parsedProfile.panNumber || '',
      registrationId: parsedProfile.registrationId || 'REG-109283-AP',
      gstNumber: parsedProfile.gstNumber || '',
      experience: parsedProfile.experience || '',
      panFile: parsedProfile.panFile || '',
      aadhaarFile: parsedProfile.aadhaarFile || '',
      gstFile: parsedProfile.gstFile || '',
      licenseFile: parsedProfile.licenseFile || '',
      bankFile: parsedProfile.bankFile || '',
      signatureFile: parsedProfile.signatureFile || ''
    };
    const savedBank = localStorage.getItem(`buyerBankDetails_${mobile}`) || localStorage.getItem('buyerBankDetails');
    if (savedBank) {
      try {
        this.bankDetails = JSON.parse(savedBank);
      } catch (e) {
        console.error(e);
      }
    }

    // Load Profile Photo from storage (PostgreSQL with localStorage fallback)
    const mobileForPhoto = localStorage.getItem('currentUserMobile') || '+918888888888';
    this.loadProfilePhotoFromStorage(mobileForPhoto);

    // Populate uploaded documents from registration data
    const profile = this.profileDetails as any;
    this.uploadedDocuments = [
      { name: 'GST Registration Certificate', fileName: profile.gstFile || 'gst_registration_cert.pdf', uploadDate: 'June 28, 2026', status: 'Verified' },
      { name: 'PAN Card Document', fileName: profile.panFile || 'pan_card_doc.pdf', uploadDate: 'June 28, 2026', status: 'Verified' },
      { name: 'Business Incorporation License', fileName: profile.licenseFile || 'business_incorporation_license.pdf', uploadDate: 'June 28, 2026', status: 'Verified' },
      { name: 'Corporate Bank Authorization', fileName: profile.bankFile || 'corporate_bank_auth.pdf', uploadDate: 'June 28, 2026', status: 'Pending' },
      { name: 'Aadhaar Card Document', fileName: profile.aadhaarFile || 'aadhaar_card_doc.pdf', uploadDate: 'June 28, 2026', status: 'Verified' },
      { name: 'Authorized Signatory Signature', fileName: profile.signatureFile || 'signature_scan.png', uploadDate: 'June 28, 2026', status: 'Pending' }
    ];
  }

  ngOnDestroy(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
  }

  // Calculate values
  calculatePortfolioSummary(): void {
    let holdingsVal = 0;
    let qtyTotal = 0;
    this.holdings.forEach(h => {
      holdingsVal += h.quantity * h.currentPrice;
      qtyTotal += h.quantity;
    });
    this.portfolioValue = holdingsVal;
    this.totalHoldingsQty = qtyTotal;
  }

  // Generates dynamic bids/asks centered around the live credit price
  generateOrderBook(): void {
    const bidsArr: OrderBookEntry[] = [];
    const asksArr: OrderBookEntry[] = [];

    for (let i = 1; i <= 5; i++) {
      const bidPrice = Number((this.livePrice - (i * 0.05) - (Math.random() * 0.02)).toFixed(2));
      const bidQty = Math.floor(Math.random() * 800) + 100;
      bidsArr.push({
        price: bidPrice,
        quantity: bidQty,
        total: Number((bidPrice * bidQty).toFixed(2))
      });

      const askPrice = Number((this.livePrice + (i * 0.05) + (Math.random() * 0.02)).toFixed(2));
      const askQty = Math.floor(Math.random() * 800) + 100;
      asksArr.push({
        price: askPrice,
        quantity: askQty,
        total: Number((askPrice * askQty).toFixed(2))
      });
    }

    this.bids = bidsArr.sort((a, b) => b.price - a.price);
    this.asks = asksArr.sort((a, b) => a.price - b.price);
  }

  // Live Market pricing updates
  startLiveMarket(): void {
    this.priceUpdateInterval = setInterval(() => {
      // Simulate micro fluctuation
      const delta = (Math.random() - 0.5) * 0.1; // -$0.05 to +$0.05
      this.livePrice = Number((this.livePrice + delta).toFixed(2));
      
      // Keep within bounds
      if (this.livePrice < 10) this.livePrice = 10;
      if (this.livePrice > 45) this.livePrice = 45;
      
      // Update selected project price to match live price
      const currentProj = this.holdings.find(h => h.projectName === this.selectedProject);
      if (currentProj) {
        currentProj.currentPrice = this.livePrice;
      }
      
      // Re-calculate
      const basePrice = this.getProjectBasePrice(this.selectedProject);
      this.priceChange = Number((((this.livePrice - basePrice) / basePrice) * 100).toFixed(2));
      this.calculatePortfolioSummary();
      this.generateOrderBook();
    }, 4000);
  }

  getProjectBasePrice(project: string): number {
    switch (project) {
      case 'Nellore Solar Farm':
        return 20.45;
      case 'Godavari Mangrove Restoration':
        return 26.80;
      case 'Satara Agroforestry':
        return 16.90;
      default:
        return 20.00;
    }
  }

  getProjectAbbreviation(project: string): string {
    switch (project) {
      case 'Nellore Solar Farm':
        return 'NSF';
      case 'Godavari Mangrove Restoration':
        return 'GMR';
      case 'Satara Agroforestry':
        return 'SAF';
      default:
        return 'CREDITS';
    }
  }

  onProjectChange(): void {
    const currentProj = this.holdings.find(h => h.projectName === this.selectedProject);
    if (currentProj) {
      this.livePrice = currentProj.currentPrice;
    } else {
      this.livePrice = this.getProjectBasePrice(this.selectedProject);
    }
    this.orderPrice = this.livePrice;
    this.generateOrderBook();
    this.updateChartForProject();
  }

  updateChartForProject(): void {
    if (this.selectedProject === 'Nellore Solar Farm') {
      this.chartPoints = '10,90 30,75 50,80 70,60 90,45 110,35';
    } else if (this.selectedProject === 'Godavari Mangrove Restoration') {
      this.chartPoints = '10,40 30,45 50,30 70,55 90,65 110,50';
    } else { // Satara Agroforestry
      this.chartPoints = '10,85 30,90 50,70 70,75 90,60 110,65';
    }
  }

  // Timeframe selector
  selectTimeframe(tf: string): void {
    this.activeTimeframe = tf;
    
    // Simulate updating chart points
    if (tf === '1D') {
      this.chartPoints = '10,90 30,75 50,80 70,60 90,45 110,35';
    } else if (tf === '1W') {
      this.chartPoints = '10,85 30,95 50,70 70,55 90,65 110,25';
    } else if (tf === '1M') {
      this.chartPoints = '10,95 30,80 50,85 70,50 90,30 110,15';
    } else {
      this.chartPoints = '10,98 30,90 50,60 70,40 90,20 110,5';
    }
  }

  // Handle Order Submit
  onSubmitOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.orderQuantity || this.orderQuantity <= 0) {
      this.errorMessage = 'Please enter a valid amount of carbon credits to trade';
      return;
    }

    const priceToUse = this.orderMode === 'MARKET' ? this.livePrice : this.orderPrice;
    const totalOrderCost = this.orderQuantity * priceToUse;

    if (this.orderType === 'BUY') {
      if (totalOrderCost > this.cashBalance) {
        this.errorMessage = `Insufficient cash balance. Required: ₹${totalOrderCost.toFixed(2)}, Available: ₹${this.cashBalance.toFixed(2)}`;
        return;
      }

      // Deduct cash, add credit holdings
      this.cashBalance -= totalOrderCost;
      const existingHolding = this.holdings.find(h => h.projectName === this.selectedProject);
      if (existingHolding) {
        const totalQty = existingHolding.quantity + this.orderQuantity;
        // recalculate avg price
        existingHolding.avgBuyPrice = Number((((existingHolding.quantity * existingHolding.avgBuyPrice) + totalOrderCost) / totalQty).toFixed(2));
        existingHolding.quantity = totalQty;
      } else {
        let origin = 'Unknown Location';
        let registry = 'APCCB Standard';
        
        if (this.selectedProject === 'Nellore Solar Farm') {
          origin = 'Nellore, Andhra Pradesh';
          registry = 'Verra (VCS)';
        } else if (this.selectedProject === 'Godavari Mangrove Restoration') {
          origin = 'East Godavari, Andhra Pradesh';
          registry = 'Gold Standard';
        } else if (this.selectedProject === 'Satara Agroforestry') {
          origin = 'Satara, Maharashtra';
          registry = 'CDM Registry';
        }

        this.holdings.push({
          id: `PRJ00${this.holdings.length + 1}`,
          projectName: this.selectedProject,
          projectType: this.selectedProject === 'Nellore Solar Farm' ? 'Clean Energy' :
                       this.selectedProject === 'Godavari Mangrove Restoration' ? 'Blue Carbon' : 'Nature-based',
          quantity: this.orderQuantity,
          avgBuyPrice: priceToUse,
          currentPrice: priceToUse,
          origin: origin,
          registry: registry
        });
      }

      // Add to txns
      this.addTransaction('BUY', this.selectedProject, this.orderQuantity, priceToUse, totalOrderCost);
      this.successMessage = `Successfully placed BUY order for ${this.orderQuantity} credits at ₹${priceToUse.toFixed(2)}/tCO2e!`;
    } else {
      // SELL order
      const existingHolding = this.holdings.find(h => h.projectName === this.selectedProject);
      if (!existingHolding || existingHolding.quantity < this.orderQuantity) {
        this.errorMessage = `Insufficient carbon credit holdings. You only hold ${existingHolding ? existingHolding.quantity : 0} credits of this project.`;
        return;
      }

      // Add cash, deduct holdings
      this.cashBalance += totalOrderCost;
      existingHolding.quantity -= this.orderQuantity;

      // Clean up empty holding
      if (existingHolding.quantity === 0) {
        this.holdings = this.holdings.filter(h => h.projectName !== this.selectedProject);
      }

      this.addTransaction('SELL', this.selectedProject, this.orderQuantity, priceToUse, totalOrderCost);
      this.successMessage = `Successfully placed SELL order for ${this.orderQuantity} credits at ₹${priceToUse.toFixed(2)}/tCO2e!`;
    }

    this.calculatePortfolioSummary();
    this.orderQuantity = null;
  }

  // Offset credits
  retireHoldings(projectName: string, amount: number): void {
    if (confirm(`Are you sure you want to Retire (offset) ${amount} carbon credits from ${projectName}? This will permanently remove them from trading and retire them for green compliance.`)) {
      const holding = this.holdings.find(h => h.projectName === projectName);
      if (!holding || holding.quantity < amount) {
        alert('Insufficient credits in holdings to retire.');
        return;
      }

      holding.quantity -= amount;
      this.retiredCredits += amount;
      
      const totalCost = amount * holding.currentPrice;
      if (holding.quantity === 0) {
        this.holdings = this.holdings.filter(h => h.projectName !== projectName);
      }

      this.addTransaction('RETIRE', projectName, amount, holding.currentPrice, totalCost);
      this.calculatePortfolioSummary();
      alert(`Credits retired successfully! ${amount} tCO2e has been permanently offset to reduce carbon emissions.`);
    }
  }

  private addTransaction(type: 'BUY' | 'SELL' | 'RETIRE', projectName: string, quantity: number, price: number, total: number): void {
    const txnId = 'TXN' + (Math.floor(Math.random() * 9000) + 1000);
    this.transactions.unshift({
      id: txnId,
      timestamp: 'Just now',
      type: type,
      projectName: projectName,
      quantity: quantity,
      price: price,
      total: total,
      status: 'COMPLETED'
    });
  }

  // Profile and Wallet State
  profilePhoto: string = '';

  loadProfilePhotoFromStorage(mobile: string): void {
    const backendUrl = this.registrationService.getProfilePhotoUrl(mobile);
    this.http.head(backendUrl).subscribe({
      next: () => {
        this.profilePhoto = backendUrl;
        this.cdr.detectChanges();
      },
      error: () => {
        const savedPhoto = localStorage.getItem(`profilePhoto_${mobile}`);
        if (savedPhoto) {
          this.profilePhoto = savedPhoto;
        } else {
          this.profilePhoto = '';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onPhotoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            // Instantly update UI and save to local storage
            this.profilePhoto = compressedDataUrl;
            const mobile = localStorage.getItem('currentUserMobile') || '+918888888888';
            localStorage.setItem(`profilePhoto_${mobile}`, compressedDataUrl);
            this.cdr.detectChanges();

            // Background upload to PostgreSQL database
            this.registrationService.uploadProfilePhoto(file).subscribe({
              next: () => {
                console.log('Profile photo saved to database!');
              },
              error: (err) => {
                console.error('Failed to upload profile photo to database', err);
              }
            });
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  get displayBuyerName(): string {
    const name = this.profileDetails?.buyerName || localStorage.getItem('buyerName');
    if (name && name.trim() !== '') {
      return name.trim();
    }
    return this.profileDetails?.companyName || localStorage.getItem('companyName') || 'Registered Buyer';
  }

  get displayBuyerType(): string {
    return this.profileDetails?.selectedBuyerType || localStorage.getItem('selectedBuyerType') || localStorage.getItem('selectedUserType') || 'Organization / Corporate Buyer';
  }

  get avatarInitial(): string {
    const name = this.displayBuyerName;
    return (typeof name === 'string' && name.length > 0) ? name.charAt(0).toUpperCase() : 'B';
  }

  profileDetails: any = {
    buyerName: '',
    companyName: '',
    selectedBuyerType: 'Organization / Corporate Buyer',
    emailAddress: '',
    mobileNumber: '',
    panNumber: '',
    registrationId: 'REG-109283-AP',
    gstNumber: '',
    experience: ''
  };

  bankDetails = {
    accountHolderName: 'Bhaskar',
    bankName: 'State Bank of India',
    accountNumber: '38291039281',
    ifscCode: 'SBIN0001234',
    branchName: 'Nellore Main',
    accountType: 'Savings',
    upiId: 'bhaskar@upi'
  };
  uploadedDocuments: any[] = [];

  walletLedger: any[] = [
    { id: 'WLT5002', timestamp: '3 hours ago', type: 'DEPOSIT', amount: 5000.00 },
    { id: 'WLT4981', timestamp: '1 day ago', type: 'WITHDRAW', amount: 1200.00 }
  ];

  depositCapital(amountStr: string): void {
    const enteredAmt = parseFloat(amountStr);
    if (isNaN(enteredAmt) || enteredAmt <= 0) {
      alert('Please enter a valid amount to deposit.');
      return;
    }
    const amtInINR = this.convertAmountToINR(enteredAmt);
    this.cashBalance += amtInINR;
    this.walletLedger.unshift({
      id: 'WLT' + (Math.floor(Math.random() * 9000) + 1000),
      timestamp: 'Just now',
      type: 'DEPOSIT',
      amount: enteredAmt
    });
    alert(`Successfully deposited ${this.getCurrencySymbol()}${enteredAmt.toFixed(2)} to wallet!`);
  }

  withdrawCapital(amountStr: string): void {
    const enteredAmt = parseFloat(amountStr);
    if (isNaN(enteredAmt) || enteredAmt <= 0) {
      alert('Please enter a valid amount to withdraw.');
      return;
    }
    const amtInINR = this.convertAmountToINR(enteredAmt);
    if (this.cashBalance < amtInINR) {
      alert('Insufficient cash balance to withdraw.');
      return;
    }
    this.cashBalance -= amtInINR;
    this.walletLedger.unshift({
      id: 'WLT' + (Math.floor(Math.random() * 9000) + 1000),
      timestamp: 'Just now',
      type: 'WITHDRAW',
      amount: enteredAmt
    });
    alert(`Successfully withdrew ${this.getCurrencySymbol()}${enteredAmt.toFixed(2)} from wallet!`);
  }

  savePersonalDetails(): void {
    const mobile = localStorage.getItem('currentUserMobile') || '+918888888888';
    localStorage.setItem(`buyerProfileDetails_${mobile}`, JSON.stringify(this.profileDetails));
    localStorage.setItem('buyerProfileDetails', JSON.stringify(this.profileDetails));

    this.registrationService.savePersonalDetails({
      fullName: this.profileDetails.buyerName || this.profileDetails.companyName,
      companyName: this.profileDetails.companyName,
      userTypeName: this.profileDetails.selectedBuyerType,
      email: this.profileDetails.emailAddress,
      mobileNumber: this.profileDetails.mobileNumber,
      panNumber: this.profileDetails.panNumber,
      gstNumber: this.profileDetails.gstNumber
    }).subscribe({
      next: () => {
        console.log('✅ Buyer personal details saved in Postgres DB');
        alert('Personal Details saved successfully!');
      },
      error: (err: any) => {
        console.warn('Backend savePersonalDetails notice:', err);
        alert('Personal Details saved successfully!');
      }
    });
  }

  saveBankDetails(): void {
    const mobile = localStorage.getItem('currentUserMobile') || '+918888888888';
    localStorage.setItem(`buyerBankDetails_${mobile}`, JSON.stringify(this.bankDetails));
    localStorage.setItem('buyerBankDetails', JSON.stringify(this.bankDetails));
    alert('Bank Details saved successfully!');
  }

  downloadCertificate(): void {
    const printContent = document.getElementById('compliance-certificate');
    const WindowObject = window.open('', '_blank', 'width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
    if (WindowObject) {
      WindowObject.document.writeln('<html><head><title>Carbon Sequestration Compliance Certificate</title>');
      WindowObject.document.writeln('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">');
      WindowObject.document.writeln('<style>');
      WindowObject.document.writeln('body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #f1f5f9; color: #0f172a; text-align: center; }');
      WindowObject.document.writeln('.cert-border { border: 10px double #004c49; padding: 50px 40px; background-color: #ffffff; border-radius: 16px; max-width: 850px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.08); position: relative; }');
      WindowObject.document.writeln('.watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 90px; font-weight: 800; color: rgba(0, 76, 73, 0.025); z-index: 0; pointer-events: none; text-transform: uppercase; letter-spacing: 6px; }');
      WindowObject.document.writeln('.cert-header { margin-bottom: 35px; position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }');
      WindowObject.document.writeln('.cert-title { font-size: 30px; font-weight: 800; color: #004c49; margin: 10px 0; letter-spacing: 0.5px; }');
      WindowObject.document.writeln('.cert-sub { font-size: 13px; color: #059669; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; }');
      WindowObject.document.writeln('.cert-recipient { font-size: 26px; font-weight: 700; color: #0f172a; margin: 24px 0; text-decoration: underline; text-underline-offset: 6px; }');
      WindowObject.document.writeln('.cert-desc { font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0 auto 35px auto; max-width: 650px; }');
      WindowObject.document.writeln('.cert-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border-top: 1px solid #e2ece9; border-bottom: 1px solid #e2ece9; padding: 24px 0; margin-bottom: 35px; text-align: left; }');
      WindowObject.document.writeln('.metric-item { display: flex; flex-direction: column; gap: 4px; }');
      WindowObject.document.writeln('.metric-label { font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }');
      WindowObject.document.writeln('.metric-val { font-size: 16.5px; font-weight: 700; color: #004c49; }');
      WindowObject.document.writeln('.cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; }');
      WindowObject.document.writeln('.signature-box { text-align: center; width: 220px; }');
      WindowObject.document.writeln('.signature-line { border-bottom: 1.5px solid #94a3b8; margin-bottom: 8px; height: 40px; font-family: "Courier New", Courier, monospace; font-style: italic; color: #004c49; font-size: 18px; line-height: 40px; }');
      WindowObject.document.writeln('.signature-title { font-size: 12px; color: #64748b; font-weight: 600; }');
      WindowObject.document.writeln('.badge-verified { background-color: rgba(5, 150, 105, 0.08); color: #059669; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(5, 150, 105, 0.15); margin-bottom: 12px; }');
      WindowObject.document.writeln('</style></head><body>');
      WindowObject.document.writeln(printContent ? printContent.innerHTML : 'Certificate Content Error');
      WindowObject.document.writeln('<script>window.onload = function() { window.print(); }</script>');
      WindowObject.document.writeln('</body></html>');
      WindowObject.document.close();
    }
  }

  // Handle Search and Sync Actions
  onSearchFocus(): void {
    this.showSearchDropdown = true;
    this.onSearch();
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.searchResults = [];
      return;
    }

    const results: any[] = [];

    // 1. Match tabs
    const buyerTabs = [
      { name: 'Live Terminal', icon: 'bi-cpu-fill' },
      { name: 'Order History', icon: 'bi-journal-check' },
      { name: 'Offsets/Retirement', icon: 'bi-tree-fill' },
      { name: 'Compliance', icon: 'bi-shield-check' },
      { name: 'Certificate', icon: 'bi-file-earmark-pdf' },
      { name: 'Wallet', icon: 'bi-wallet2' },
      { name: 'Support', icon: 'bi-chat-dots' },
      { name: 'Profile', icon: 'bi-person-circle' }
    ];

    buyerTabs.forEach(tab => {
      if (tab.name.toLowerCase().includes(query)) {
        results.push({
          icon: tab.icon,
          title: tab.name,
          subtitle: `Navigate to ${tab.name} tab`,
          type: 'tab',
          value: tab.name
        });
      }
    });

    // 2. Match assets / holdings
    this.holdings.forEach(h => {
      if (h.projectName.toLowerCase().includes(query) || h.projectType.toLowerCase().includes(query)) {
        results.push({
          icon: 'bi-award-fill',
          title: h.projectName,
          subtitle: `${h.projectType} • ${h.quantity} tCO2e • ₹${h.currentPrice}/tCO2e`,
          type: 'project',
          value: h.projectName
        });
      }
    });

    // 3. Match transactions
    this.transactions.forEach(t => {
      if (t.id.toLowerCase().includes(query) || t.projectName.toLowerCase().includes(query)) {
        results.push({
          icon: t.type === 'BUY' ? 'bi-cart-plus' : t.type === 'SELL' ? 'bi-cart-dash' : 'bi-tree',
          title: `${t.type} ${t.projectName}`,
          subtitle: `${t.id} • ${t.quantity} credits @ ₹${t.price} • ${t.timestamp}`,
          type: 'transaction',
          value: t
        });
      }
    });

    this.searchResults = results.slice(0, 8);
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainers = document.querySelectorAll('.main-content, .dashboard-container, .app-container, main, body, html');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }

  selectSearchResult(result: any): void {
    this.searchQuery = '';
    this.showSearchDropdown = false;
    
    if (result.type === 'tab') {
      this.selectTab(result.value);
    } else if (result.type === 'project') {
      this.selectTab('Live Terminal');
      this.selectedProject = result.value;
      this.onProjectChange();
    } else if (result.type === 'transaction') {
      this.selectTab('Order History');
    }
  }

  syncData(): void {
    this.isSyncing = true;
    setTimeout(() => {
      this.isSyncing = false;
      
      const mobile = localStorage.getItem('currentUserMobile') || '+918888888888';
      const savedProfile = localStorage.getItem(`buyerProfileDetails_${mobile}`) || localStorage.getItem('buyerProfileDetails');
      if (savedProfile) {
        this.profileDetails = JSON.parse(savedProfile);
      }
      const savedBank = localStorage.getItem(`buyerBankDetails_${mobile}`) || localStorage.getItem('buyerBankDetails');
      if (savedBank) {
        this.bankDetails = JSON.parse(savedBank);
      }

      this.calculatePortfolioSummary();
      this.generateOrderBook();
      
      // Visual toast feedback
      const alertDiv = document.createElement('div');
      alertDiv.className = 'sync-toast';
      alertDiv.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i> Buyer metrics refreshed!`;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 3000);
    }, 1000);
  }

  // Logout
  logout(): void {
    if (confirm('Are you sure you want to log out of the Carbon Credits Trading Portal?')) {
      this.router.navigate(['/']);
    }
  }

  isAdminViewingMode(): boolean {
    return localStorage.getItem('isAdminViewing') === 'true';
  }

  returnToAdminConsole(): void {
    localStorage.removeItem('isAdminViewing');
    const origMobile = localStorage.getItem('admin_orig_mobile');
    if (origMobile) {
      localStorage.setItem('currentUserMobile', origMobile);
      localStorage.setItem('loginMobile', origMobile);
      localStorage.removeItem('admin_orig_mobile');
    } else {
      localStorage.removeItem('currentUserMobile');
      localStorage.removeItem('loginMobile');
    }
    this.router.navigate(['/admin/dashboard']);
  }
}
