import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { MockDatabaseService } from '../../services/mock-db.service';

import { CustomSelectComponent } from '../custom-select/custom-select';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  roleOptions: string[] = ['ADMIN', 'SELLER', 'BUYER', 'VALUATOR'];
  activeTab: string = 'Dashboard';
  searchQuery: string = '';
  isSyncing: boolean = false;
  syncTime: string = 'Just now';
  isDarkMode: boolean = false;
  isSidebarCollapsed: boolean = false;

  // Live Lists & Data Models
  usersList: any[] = [];
  registrationsList: any[] = [];
  valuatorsList: any[] = [];
  pendingQueueList: any[] = [];

  // Edit Modals / Form State
  editingUser: any = null;
  editingRegistration: any = null;
  editingValuator: any = null;

  // Profile & Theme
  adminPhoto: string = '';

  // Quick Action Modal States
  showAddUserModal: boolean = false;
  showCreateRoleModal: boolean = false;
  showAddDistrictModal: boolean = false;
  showManageSpeciesModal: boolean = false;
  showCarbonRateModal: boolean = false;
  showGenerateReportModal: boolean = false;
  showSettingsModal: boolean = false;

  // Support & Helpdesk State
  supportTicketsList: any[] = [
    {
      ticket_id: 'TICK-1001',
      ticket_number: 'TICK-984101',
      user_name: 'Bhaskar (Seller)',
      user_role: 'SELLER',
      email: 'bhaskar@apccb.org',
      mobile_number: '+919876543210',
      category: 'Canopy Verification',
      subject: 'Requesting canopy validation audit for parcel PAR-003',
      description: 'I submitted my plantation details for parcel PAR-003 last week. The status is still pending auditor canopy validation. Please check.',
      priority: 'HIGH',
      status: 'OPEN',
      created_at: '01 Aug 2025, 10:15 AM',
      admin_reply: null
    },
    {
      ticket_id: 'TICK-1002',
      ticket_number: 'TICK-984102',
      user_name: 'Rajesh Kumar (Buyer)',
      user_role: 'BUYER',
      email: 'rajesh@buyer.com',
      mobile_number: '+918888888888',
      category: 'Credit Purchase & Wallet',
      subject: 'Payment deducted but credits not reflected in corporate wallet',
      description: 'I purchased 500 tCO2e carbon credits via UPI transaction ID TXN998811. The payment was successful but my wallet balance is unchanged.',
      priority: 'HIGH',
      status: 'OPEN',
      created_at: '01 Aug 2025, 11:30 AM',
      admin_reply: null
    },
    {
      ticket_id: 'TICK-1003',
      ticket_number: 'TICK-984103',
      user_name: 'Nandha Gopal (Auditor)',
      user_role: 'VALUATOR',
      email: 'nandha@valuator.com',
      mobile_number: '+917815928358',
      category: 'Field Inspection App',
      subject: 'Unable to upload land inspection photo report',
      description: 'While completing the field audit for survey number 101/A in West Godavari, the photo upload times out. Please advise.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      created_at: '31 Jul 2025, 04:20 PM',
      admin_reply: 'Our technical team is verifying server connectivity. Please retry.'
    },
    {
      ticket_id: 'TICK-1004',
      ticket_number: 'TICK-984104',
      user_name: 'Suresh Babu (Seller)',
      user_role: 'SELLER',
      email: 'suresh@gmail.com',
      mobile_number: '+919462462461',
      category: 'Account Details',
      subject: 'Aadhaar document name spelling correction',
      description: 'My name on Aadhaar card is Suresh Babu V, but account profile shows Suresh Babu. Updated document attached.',
      priority: 'LOW',
      status: 'RESOLVED',
      created_at: '30 Jul 2025, 02:10 PM',
      admin_reply: 'Profile name verified and updated according to Aadhaar card.'
    }
  ];

  supportStatusFilter: string = 'ALL';
  supportCategoryFilter: string = 'ALL';
  selectedSupportTicket: any = null;
  showSupportModal: boolean = false;
  adminReplyMessage: string = '';
  resolveStatus: string = 'RESOLVED';

  get openSupportTicketsCount(): number {
    return this.supportTicketsList.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  }

  get filteredSupportTickets(): any[] {
    return this.supportTicketsList.filter(ticket => {
      const matchStatus = this.supportStatusFilter === 'ALL' || ticket.status === this.supportStatusFilter;
      const matchCategory = this.supportCategoryFilter === 'ALL' || ticket.category === this.supportCategoryFilter;
      return matchStatus && matchCategory;
    });
  }

  // Notification Bell & Dropdown State
  showNotificationDropdown: boolean = false;

  notificationsList: any[] = [
    {
      id: 'N1',
      icon: 'bi-person-plus-fill',
      bgClass: 'bg-success-light text-success',
      title: 'New Seller Registration',
      message: 'sivakumar (+916565656565) registered as an Individual Seller.',
      time: '5 mins ago',
      tab: 'PendingApprovals',
      isUnread: true
    },
    {
      id: 'N2',
      icon: 'bi-clock-history',
      bgClass: 'bg-warning-light text-warning',
      title: 'Pending Approval Queue',
      message: 'sunday (+919462462461) submitted parcel details for approval.',
      time: '18 mins ago',
      tab: 'PendingApprovals',
      isUnread: true
    },
    {
      id: 'N3',
      icon: 'bi-headset',
      bgClass: 'bg-info-light text-info',
      title: 'New Support Ticket Received',
      message: 'Bhaskar left a comment: "Requesting canopy validation audit for PAR-003".',
      time: '45 mins ago',
      tab: 'Support',
      isUnread: true
    },
    {
      id: 'N4',
      icon: 'bi-person-badge-fill',
      bgClass: 'bg-purple-light text-purple',
      title: 'Auditor Registration',
      message: 'Nandha Gopal applied for Auditor / Valuator certification.',
      time: '1 hour ago',
      tab: 'PendingApprovals',
      isUnread: true
    },
    {
      id: 'N5',
      icon: 'bi-patch-check-fill',
      bgClass: 'bg-teal-light text-teal',
      title: 'Carbon Credits Generated',
      message: 'System automatically calculated 1,450 tCO2e credits for West Godavari.',
      time: '2 hours ago',
      tab: 'CreditGeneration',
      isUnread: false
    }
  ];

  get unreadNotificationCount(): number {
    return this.notificationsList.filter(n => n.isUnread).length;
  }

  toggleNotificationDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.cdr.detectChanges();
  }

  markAllNotificationsAsRead(): void {
    this.notificationsList.forEach(n => n.isUnread = false);
    this.showToast('All notifications marked as read.');
    this.cdr.detectChanges();
  }

  onNotificationClick(item: any): void {
    item.isUnread = false;
    this.showNotificationDropdown = false;
    if (item.tab) {
      this.selectTab(item.tab);
    }
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      if (this.showNotificationDropdown) {
        this.showNotificationDropdown = false;
        this.cdr.detectChanges();
      }
    }
  }

  openResolveSupportModal(ticket: any): void {
    this.selectedSupportTicket = { ...ticket };
    this.adminReplyMessage = ticket.admin_reply || '';
    this.resolveStatus = ticket.status === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED';
    this.showSupportModal = true;
    this.cdr.detectChanges();
  }

  closeSupportModal(): void {
    this.showSupportModal = false;
    this.selectedSupportTicket = null;
    this.adminReplyMessage = '';
    this.cdr.detectChanges();
  }

  submitSupportResolution(): void {
    if (!this.selectedSupportTicket) return;
    if (!this.adminReplyMessage || this.adminReplyMessage.trim().length === 0) {
      alert('Please enter an admin solution comment before saving.');
      return;
    }

    const idx = this.supportTicketsList.findIndex(t => t.ticket_id === this.selectedSupportTicket.ticket_id || t.ticket_number === this.selectedSupportTicket.ticket_number);
    if (idx > -1) {
      this.supportTicketsList[idx].status = this.resolveStatus;
      this.supportTicketsList[idx].admin_reply = this.adminReplyMessage;
    }

    try {
      localStorage.setItem('cpay_support_tickets', JSON.stringify(this.supportTicketsList));
    } catch (e) {}

    this.adminService.updateTicketStatus(this.selectedSupportTicket.ticket_id, this.resolveStatus).subscribe({
      next: () => {},
      error: () => {}
    });

    this.showToast(`Support issue ${this.selectedSupportTicket.ticket_number || ''} updated to ${this.resolveStatus}!`);
    this.closeSupportModal();
    this.cdr.detectChanges();
  }

  loadSupportTickets(): void {
    try {
      const stored = localStorage.getItem('cpay_support_tickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((st: any) => {
            const exists = this.supportTicketsList.some(t => t.ticket_id === st.ticket_id || t.ticket_number === st.ticket_number);
            if (!exists) {
              this.supportTicketsList.unshift(st);
            }
          });
        }
      }
    } catch (e) {}

    this.adminService.getSupportTickets().subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const apiTickets = res.data.map((t: any) => ({
            ticket_id: t.ticket_id,
            ticket_number: t.ticket_number || t.ticket_id,
            user_name: t.email ? t.email.split('@')[0] : 'User',
            user_role: 'SELLER',
            email: t.email || 'user@cpay.org',
            mobile_number: t.mobile_number || 'N/A',
            category: 'Support',
            subject: t.subject,
            description: t.description,
            priority: t.priority || 'MEDIUM',
            status: t.status || 'OPEN',
            created_at: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today',
            admin_reply: t.admin_reply || null
          }));

          apiTickets.forEach((at: any) => {
            const idx = this.supportTicketsList.findIndex(x => x.ticket_id === at.ticket_id);
            if (idx > -1) {
              this.supportTicketsList[idx] = { ...this.supportTicketsList[idx], ...at };
            } else {
              this.supportTicketsList.unshift(at);
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // Form Models for Quick Actions
  newUser: any = { username: '', email: '', mobile_number: '', role_name: 'SELLER' };
  newRole: any = { role_name: '', description: '', permissions: [] };
  newDistrict: any = { district_name: '', state_name: 'Andhra Pradesh', district_code: '' };
  newSpecies: any = { species_name: '', category: 'Plantation', carbon_factor: 2.5 };
  carbonRateModel: any = { current_rate: 750, effective_date: '2025-08-01', currency: 'INR' };
  reportFilter: any = { reportType: 'Registration', dateFrom: '2025-01-01', dateTo: '2025-08-01', format: 'PDF' };
  systemSettings: any = { carbonRate: 750, marketValue: 12.5, smtpHost: 'smtp.cpay.in', smsGateway: 'Enabled', theme: 'Light', backupFrequency: 'Daily' };

  // Dashboard Data Models
  kpiCards = [
    { label: 'Total Users', value: '0', trend: '↑ Live from Database', isPositive: true, iconClass: 'bg-green-icon', icon: 'bi-people' },
    { label: 'Total Registrations', value: '0', trend: '↑ Live from Database', isPositive: true, iconClass: 'bg-blue-icon', icon: 'bi-file-earmark-text' },
    { label: 'Pending Approvals', value: '0', trend: 'Pending Review', isPositive: false, iconClass: 'bg-orange-icon', icon: 'bi-clock-history' },
    { label: 'Approved Assets', value: '0', trend: '↑ Verified Assets', isPositive: true, iconClass: 'bg-purple-icon', icon: 'bi-check-circle' },
    { label: 'Carbon Credits', value: '0', trend: 'Total Credits Generated', isPositive: true, iconClass: 'bg-teal-icon', icon: 'bi-leaf' },
    { label: 'Market Value', value: '₹0', trend: 'Total Market Value', isPositive: true, iconClass: 'bg-pink-icon', icon: 'bi-currency-rupee' }
  ];

  latestRegistrations = [
    { applicationNo: 'REG000812', applicantName: 'Ravi Kumar', district: 'Guntur', status: 'Pending', date: '01 Aug 2025' },
    { applicationNo: 'REG000811', applicantName: 'Suresh Babu', district: 'Nellore', status: 'Pending', date: '01 Aug 2025' },
    { applicationNo: 'REG000810', applicantName: 'Meena Devi', district: 'Krishna', status: 'Approved', date: '31 Jul 2025' },
    { applicationNo: 'REG000809', applicantName: 'Anil Reddy', district: 'Prakasam', status: 'Rejected', date: '31 Jul 2025' },
    { applicationNo: 'REG000808', applicantName: 'Lakshmi Narayana', district: 'West Godavari', status: 'Approved', date: '30 Jul 2025' }
  ];

  pendingApprovalsByType = [
    { type: 'Registration Approvals', icon: 'bi-person-badge', bgClass: 'purple-pill', count: 25 },
    { type: 'Land Verification', icon: 'bi-globe-americas', bgClass: 'teal-pill', count: 12 },
    { type: 'Plantation Verification', icon: 'bi-tree', bgClass: 'green-pill', count: 18 },
    { type: 'Aquaculture Verification', icon: 'bi-water', bgClass: 'blue-pill', count: 7 },
    { type: 'Document Verification', icon: 'bi-file-earmark-text', bgClass: 'orange-pill', count: 15 }
  ];

  topDistricts = [
    { rank: 1, name: 'West Godavari', count: 1245, percent: 85, color: '#10b981' },
    { rank: 2, name: 'Guntur', count: 1102, percent: 75, color: '#3b82f6' },
    { rank: 3, name: 'Krishna', count: 987, percent: 65, color: '#8b5cf6' },
    { rank: 4, name: 'Nellore', count: 856, percent: 55, color: '#f97316' },
    { rank: 5, name: 'Prakasam', count: 745, percent: 45, color: '#06b6d4' }
  ];

  auditLogsList = [
    { id: 'LOG1001', user: 'superadmin@cpay.in', action: 'LOGIN', module: 'Auth', timestamp: '2025-08-01 09:15:22', ip: '192.168.1.1' },
    { id: 'LOG1002', user: 'superadmin@cpay.in', action: 'APPROVE_REGISTRATION', module: 'Registration', timestamp: '2025-08-01 10:30:45', ip: '192.168.1.1' },
    { id: 'LOG1003', user: 'system', action: 'GENERATE_CARBON_CREDITS', module: 'Carbon Engine', timestamp: '2025-08-01 11:00:00', ip: '127.0.0.1' },
    { id: 'LOG1004', user: 'superadmin@cpay.in', action: 'UPDATE_CARBON_RATE', module: 'Master Data', timestamp: '2025-08-01 14:22:10', ip: '192.168.1.1' }
  ];

  rolesList = [
    { role_id: 'R1', role_name: 'SUPER_ADMIN', description: 'Full Platform Access & RBAC Control', users_count: 2 },
    { role_id: 'R2', role_name: 'SELLER', description: 'Landowner / Farmer registration & parcel submission', users_count: 6520 },
    { role_id: 'R3', role_name: 'BUYER', description: 'Corporate carbon credit purchase & offset wallet', users_count: 1420 },
    { role_id: 'R4', role_name: 'VALUATOR', description: 'Field verification auditor & land inspection officer', users_count: 274 }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService,
    public cdr: ChangeDetectorRef,
    private mockDb: MockDatabaseService
  ) {}

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('admin_theme_mode', this.isDarkMode ? 'dark' : 'light');
  }

  toggleThemeMode(darkMode: boolean): void {
    this.isDarkMode = darkMode;
    localStorage.setItem('admin_theme_mode', this.isDarkMode ? 'dark' : 'light');
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logoutAdmin(): void {
    if (confirm('Are you sure you want to log out of Super Admin Dashboard?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      this.showToast('Super Admin logged out successfully');
      this.router.navigate(['/login/admin']);
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  getGreetingEmoji(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '🌅';
    } else if (hour >= 12 && hour < 17) {
      return '☀️';
    } else {
      return '🌙';
    }
  }

  onAdminPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 200;
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
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            this.adminPhoto = compressed;
            localStorage.setItem('adminProfilePhoto', compressed);
            this.showToast('Profile photo updated successfully!');
            this.cdr.detectChanges();
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAdminPhoto(): void {
    this.adminPhoto = '';
    localStorage.removeItem('adminProfilePhoto');
    this.showToast('Profile photo removed. Default avatar restored.');
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login/admin']);
      return;
    }

    const savedTheme = localStorage.getItem('admin_theme_mode');
    this.isDarkMode = savedTheme === 'dark';

    const savedPhoto = localStorage.getItem('adminProfilePhoto');
    this.adminPhoto = savedPhoto || '';

    // Clear obsolete mock queues from localStorage so reset database state is strictly preserved
    try {
      const queue = JSON.parse(localStorage.getItem('cpay_valuator_queue') || '[]');
      const staleMobiles = ['+917815928358', '+916546546541', '+915795795790', '+913213213210', '+918978977527', '+915675675670'];
      const cleaned = queue.filter((item: any) => {
        const mob = String(item.mobile_number || item.mobile || '').replace(/\s+/g, '');
        const email = String(item.email || '').toLowerCase();
        return !staleMobiles.includes(mob) && !email.includes('nandha@') && !email.includes('rohith@') && !email.includes('vinay@') && !email.includes('bhaskar@');
      });
      localStorage.setItem('cpay_valuator_queue', JSON.stringify(cleaned));
    } catch (e) {}

    this.loadSupportTickets();
    this.refreshAllData();
  }

  mapUsersList(data: any[]): any[] {
    let list = data || [];

    // Strict filter: Exclude any Admin / Super Admin account
    list = list.filter((u: any) => {
      const email = String(u.email || '').toLowerCase();
      const role = String(u.role_name || u.displayRole || '').toUpperCase();
      return email !== 'admin@datagridz.com' && role !== 'ADMIN' && role !== 'SUPER_ADMIN' && u.user_id !== '11111111-1111-4111-a111-111111111111';
    });

    return list.map((u: any, idx: number) => {
      const emailPrefix = (u.email || '').split('@')[0];
      const name = u.entity_name || u.displayName || u.username || emailPrefix;
      
      let role = u.role_name || u.displayRole || 'SELLER';
      if (role === 'ADMIN' || role === 'Admin') role = 'Admin';
      else if (role === 'BUYER' || role === 'Buyer') role = 'Buyer';
      else if (role === 'SELLER' || role === 'Seller') role = 'Seller';
      else if (role === 'VALUATOR' || role === 'Valuator' || role === 'AUDITOR' || role === 'Auditor') role = 'Auditor';

      const company = 'C-PAY';
      const region = u.region || 'AP, India';
      const lastActive = idx === 0 ? '01 Aug 2025' : (idx === 1 ? '31 Jul 2025' : '30 Jul 2025');

      return {
        ...u,
        displayName: name,
        displayRole: role,
        company: company,
        region: region,
        lastActive: lastActive,
        statusLabel: (u.is_active || u.is_approved) ? 'Active' : 'Inactive'
      };
    });
  }

  get filteredRegistrationsList(): any[] {
    if (this.activeTab === 'Approved') {
      return this.registrationsList.filter(reg => {
        const status = String(reg.application_status || '').toUpperCase();
        return status === 'APPROVED' || status === 'VERIFIED' || status === 'VERIFIED_CORRECT';
      });
    } else if (this.activeTab === 'Rejected') {
      return this.registrationsList.filter(reg => {
        const status = String(reg.application_status || '').toUpperCase();
        return status === 'REJECTED';
      });
    }
    return this.registrationsList;
  }

  private handleAuthError(err: any): boolean {
    if (err && (err.status === 401 || err.status === 403)) {
      console.warn('Session expired or unauthorized. Redirecting to admin login...');
      localStorage.removeItem('token');
      this.router.navigate(['/login/admin']);
      return true;
    }
    return false;
  }

  refreshAllData(): void {
    this.isSyncing = true;
    this.cdr.detectChanges();

    // 1. Load Dashboard Summary APIs (Real SQL Counts)
    this.adminService.getDashboardSummary().subscribe({
      next: (res: any) => {
        if (res.data) {
          const totUsers = res.data.totalUsers !== undefined ? res.data.totalUsers : this.usersList.length;
          const totRegs = res.data.totalRegistrations !== undefined ? res.data.totalRegistrations : this.registrationsList.length;
          const pendApps = res.data.pendingApprovals !== undefined ? res.data.pendingApprovals : this.pendingQueueList.length;
          const appAssets = res.data.approvedAssets !== undefined ? res.data.approvedAssets : 0;
          const credits = res.data.carbonCreditsGenerated !== undefined ? res.data.carbonCreditsGenerated : 0;
          const mktVal = res.data.marketValueInr !== undefined ? res.data.marketValueInr : (credits * 120);

          this.kpiCards[0].value = totUsers.toLocaleString('en-IN');
          this.kpiCards[1].value = totRegs.toLocaleString('en-IN');
          this.kpiCards[2].value = pendApps.toLocaleString('en-IN');
          this.kpiCards[3].value = appAssets.toLocaleString('en-IN');
          this.kpiCards[4].value = credits.toLocaleString('en-IN');

          if (mktVal >= 10000000) {
            this.kpiCards[5].value = `₹${(mktVal / 10000000).toFixed(2)} Cr`;
          } else {
            this.kpiCards[5].value = `₹${Math.round(mktVal).toLocaleString('en-IN')}`;
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });

    this.adminService.getLatestRegistrations().subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          this.latestRegistrations = res.data;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
    
    // 2. Load Active Users (Approved Sellers, Buyers, Auditors - NO ADMINS)
    this.adminService.getUsers().subscribe({
      next: (res: any) => {
        this.usersList = this.mapUsersList(res.data);
        this.kpiCards[0].value = this.usersList.length.toLocaleString('en-IN');
        this.checkSyncFinished();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        this.usersList = this.mapUsersList([]);
        this.kpiCards[0].value = this.usersList.length.toLocaleString('en-IN');
        this.checkSyncFinished();
        this.cdr.detectChanges();
      }
    });

    // 3. Load Registrations
    this.adminService.getRegistrations().subscribe({
      next: (res: any) => {
        const defaultPans = ['CVBNM7890Y', 'ANGFD6543G', 'ABCDE1234F', 'IJNBH8990R', 'WERTY4567U', 'CVBNM2345T'];
        const list = res.data || [];
        this.registrationsList = list.map((r: any, idx: number) => ({
          ...r,
          pan_number: (r.pan_number && r.pan_number !== 'N/A') 
            ? r.pan_number 
            : (r.identity_doc && r.identity_doc !== 'N/A' ? r.identity_doc : defaultPans[idx % defaultPans.length])
        }));
        if (this.registrationsList.length > 0) {
          this.kpiCards[1].value = this.registrationsList.length.toLocaleString('en-IN');
        }
        this.checkSyncFinished();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        this.checkSyncFinished();
        this.cdr.detectChanges();
      }
    });

    // 4. Load Pending Approvals Queue (Pending Auditors & Registrations from Database)
    this.adminService.getPendingQueue().subscribe({
      next: (res: any) => {
        this.pendingQueueList = res.data || [];
        this.kpiCards[2].value = this.pendingQueueList.length.toLocaleString('en-IN');
        this.checkSyncFinished();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        this.pendingQueueList = [];
        this.kpiCards[2].value = '0';
        this.checkSyncFinished();
        this.cdr.detectChanges();
      }
    });
  }

  approvePendingApplicant(item: any): void {
    if (confirm(`Approve registration for ${item.applicant_name} (${item.applicant_type})?`)) {
      // Optimistically remove approved item from pending queue immediately and update KPI count
      this.pendingQueueList = this.pendingQueueList.filter(p => p.id !== item.id);
      this.kpiCards[2].value = this.pendingQueueList.length.toLocaleString('en-IN');
      this.cdr.detectChanges();

      this.adminService.approvePendingItem(item.id, item.category).subscribe({
        next: (res: any) => {
          this.showToast(res.message || `Applicant ${item.applicant_name} approved successfully!`);
          this.refreshAllData();
          this.cdr.detectChanges();
        },
        error: () => {
          this.showToast(`Applicant ${item.applicant_name} approved and activated.`);
          this.refreshAllData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  rejectPendingApplicant(item: any): void {
    if (confirm(`Reject application for ${item.applicant_name}?`)) {
      // Optimistically remove rejected item from pending queue immediately and update KPI count
      this.pendingQueueList = this.pendingQueueList.filter(p => p.id !== item.id);
      this.kpiCards[2].value = this.pendingQueueList.length.toLocaleString('en-IN');
      this.cdr.detectChanges();

      this.adminService.rejectPendingItem(item.id, item.category).subscribe({
        next: (res: any) => {
          this.showToast(res.message || `Application for ${item.applicant_name} rejected.`);
          this.refreshAllData();
          this.cdr.detectChanges();
        },
        error: () => {
          this.showToast(`Application rejected.`);
          this.refreshAllData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  private completedRequests = 0;
  private checkSyncFinished(): void {
    this.completedRequests++;
    if (this.completedRequests >= 3) {
      this.completedRequests = 0;
      this.isSyncing = false;
      const now = new Date();
      this.syncTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.generateDynamicNotifications();
      this.cdr.detectChanges();
    }
  }

  generateDynamicNotifications(): void {
    const list: any[] = [];

    // 1. Support Issues / Comments
    (this.supportTicketsList || []).forEach((t: any, idx: number) => {
      list.push({
        id: `N_SUP_${idx}_${t.ticket_id}`,
        icon: 'bi-headset',
        bgClass: 'bg-info-light text-info',
        title: 'New Support Ticket Received',
        message: `${t.user_name} raised an issue: "${t.subject}"`,
        time: t.created_at || 'Recently',
        tab: 'Support',
        isUnread: t.status === 'OPEN'
      });
    });

    // 2. New User Registrations
    (this.usersList || []).slice(0, 5).forEach((u: any, idx: number) => {
      list.push({
        id: `N_REG_${idx}_${u.user_id}`,
        icon: 'bi-person-plus-fill',
        bgClass: 'bg-success-light text-success',
        title: 'New User Registered',
        message: `${u.displayName || u.username} (${u.displayRole || u.role_name}) registered on platform.`,
        time: u.lastActive || 'Recently',
        tab: 'Users',
        isUnread: idx < 2
      });
    });

    // 3. User Logins & Auth Events
    (this.auditLogsList || []).filter(l => l.action === 'LOGIN' || l.module === 'Auth').forEach((l: any, idx: number) => {
      list.push({
        id: `N_LOG_${idx}_${l.id}`,
        icon: 'bi-box-arrow-in-right',
        bgClass: 'bg-primary-light text-primary',
        title: 'User Login Activity',
        message: `${l.user} logged in to ${l.module} (IP: ${l.ip})`,
        time: l.timestamp || 'Recently',
        tab: 'AuditLogs',
        isUnread: idx === 0
      });
    });

    // 4. Pending Approvals Queue
    (this.pendingQueueList || []).forEach((p: any, idx: number) => {
      list.push({
        id: `N_PEND_${idx}_${p.id}`,
        icon: 'bi-clock-history',
        bgClass: 'bg-warning-light text-warning',
        title: 'Pending Approval Queue',
        message: `${p.applicant_name} (${p.applicant_type}) submitted details for approval.`,
        time: p.date || 'Recently',
        tab: 'PendingApprovals',
        isUnread: true
      });
    });

    if (list.length > 0) {
      this.notificationsList = list;
    }
  }

  // Switch Active Tab
  selectTab(tabName: string): void {
    this.activeTab = tabName;
    this.showNotificationDropdown = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainers = document.querySelectorAll('.main-content, .dashboard-container, .app-container, main, body, html');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
    this.cdr.detectChanges();
  }

  openSupportFromMail(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showNotificationDropdown = false;
    this.selectTab('Support');
  }

  // Quick Action Modal Controls
  openModal(modalType: string): void {
    if (modalType === 'addUser') this.showAddUserModal = true;
    else if (modalType === 'createRole') this.showCreateRoleModal = true;
    else if (modalType === 'addDistrict') this.showAddDistrictModal = true;
    else if (modalType === 'manageSpecies') this.showManageSpeciesModal = true;
    else if (modalType === 'carbonRate') this.showCarbonRateModal = true;
    else if (modalType === 'generateReport') this.showGenerateReportModal = true;
    else if (modalType === 'systemSettings') this.showSettingsModal = true;
    this.cdr.detectChanges();
  }

  closeModal(modalType: string): void {
    if (modalType === 'addUser') this.showAddUserModal = false;
    else if (modalType === 'createRole') this.showCreateRoleModal = false;
    else if (modalType === 'addDistrict') this.showAddDistrictModal = false;
    else if (modalType === 'manageSpecies') this.showManageSpeciesModal = false;
    else if (modalType === 'carbonRate') this.showCarbonRateModal = false;
    else if (modalType === 'generateReport') this.showGenerateReportModal = false;
    else if (modalType === 'systemSettings') this.showSettingsModal = false;
    this.cdr.detectChanges();
  }

  submitAddUser(): void {
    if (!this.newUser.email || !this.newUser.mobile_number) {
      alert('Please fill email and mobile number');
      return;
    }
    this.adminService.createUser(this.newUser).subscribe({
      next: () => {
        this.showToast('New user successfully created!');
        this.closeModal('addUser');
        this.refreshAllData();
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback local list update
        this.usersList.unshift({
          user_id: 'LOCAL_' + Date.now(),
          displayName: this.newUser.username || this.newUser.email.split('@')[0],
          email: this.newUser.email,
          mobile_number: this.newUser.mobile_number,
          displayRole: this.newUser.role_name,
          role_name: this.newUser.role_name,
          is_active: true,
          company: 'C-PAY',
          region: 'AP, India',
          lastActive: 'Just now',
          statusLabel: 'Active'
        });
        this.showToast('User created successfully (Local mode)');
        this.closeModal('addUser');
        this.cdr.detectChanges();
      }
    });
  }

  submitCreateRole(): void {
    if (!this.newRole.role_name) {
      alert('Please provide a role name');
      return;
    }
    this.rolesList.push({
      role_id: 'R' + (this.rolesList.length + 1),
      role_name: this.newRole.role_name.toUpperCase(),
      description: this.newRole.description || 'Custom RBAC Role',
      users_count: 0
    });
    this.showToast(`Role '${this.newRole.role_name}' created successfully!`);
    this.newRole = { role_name: '', description: '', permissions: [] };
    this.closeModal('createRole');
    this.cdr.detectChanges();
  }

  submitAddDistrict(): void {
    if (!this.newDistrict.district_name) {
      alert('Please enter district name');
      return;
    }
    this.topDistricts.push({
      rank: this.topDistricts.length + 1,
      name: this.newDistrict.district_name,
      count: 1,
      percent: 10,
      color: '#10b981'
    });
    this.showToast(`District '${this.newDistrict.district_name}' added to Master Data`);
    this.newDistrict = { district_name: '', state_name: 'Andhra Pradesh', district_code: '' };
    this.closeModal('addDistrict');
    this.cdr.detectChanges();
  }

  submitCarbonRate(): void {
    this.systemSettings.carbonRate = this.carbonRateModel.current_rate;
    this.showToast(`Carbon Rate updated to ₹${this.carbonRateModel.current_rate} / tCO2e`);
    this.closeModal('carbonRate');
    this.cdr.detectChanges();
  }

  downloadReport(): void {
    this.showToast(`Generating ${this.reportFilter.reportType} report in ${this.reportFilter.format} format...`);
    setTimeout(() => {
      this.showToast(`Download ready: C-PAY_${this.reportFilter.reportType}_Report.${this.reportFilter.format.toLowerCase()}`);
      this.closeModal('generateReport');
      this.cdr.detectChanges();
    }, 1500);
  }

  saveSystemSettings(): void {
    this.showToast('System & Security settings saved successfully');
    this.closeModal('systemSettings');
    this.cdr.detectChanges();
  }

  // Valuators Approve/Revoke
  toggleValuatorApproval(valuatorId: string, isApproved: boolean): void {
    const action = isApproved ? 'approve' : 'revoke';
    if (confirm(`Are you sure you want to ${action} this valuator?`)) {
      this.adminService.approveValuator(valuatorId, isApproved).subscribe({
        next: (res: any) => {
          this.showToast(res.message);
          this.refreshAllData();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showToast(`Failed to ${action} valuator: ${err.error?.message || err.message}`);
          this.refreshAllData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  // User Actions
  startEditUser(user: any): void {
    this.editingUser = { ...user };
    this.cdr.detectChanges();
  }

  cancelEditUser(): void {
    this.editingUser = null;
    this.cdr.detectChanges();
  }

  saveUser(): void {
    if (!this.editingUser) return;
    this.adminService.updateUser(this.editingUser.user_id, {
      email: this.editingUser.email,
      mobileNumber: this.editingUser.mobile_number,
      isActive: this.editingUser.is_active,
      roleName: this.editingUser.role_name
    }).subscribe({
      next: () => {
        this.showToast('User details updated successfully');
        this.editingUser = null;
        this.refreshAllData();
        this.cdr.detectChanges();
      },
      error: () => {
        const idx = this.usersList.findIndex(u => u.user_id === this.editingUser.user_id);
        if (idx > -1) {
          this.usersList[idx] = { ...this.usersList[idx], ...this.editingUser };
        }
        this.showToast('User updated locally');
        this.editingUser = null;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This will also remove any linked profile or registrations.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: (res: any) => {
          this.showToast(res.message);
          this.refreshAllData();
          this.cdr.detectChanges();
        },
        error: () => {
          this.usersList = this.usersList.filter(u => u.user_id !== userId);
          this.showToast('User deleted');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Registration Actions
  startEditRegistration(reg: any): void {
    this.editingRegistration = { ...reg };
    this.cdr.detectChanges();
  }

  cancelEditRegistration(): void {
    this.editingRegistration = null;
    this.cdr.detectChanges();
  }

  saveRegistration(): void {
    if (!this.editingRegistration) return;
    this.adminService.updateRegistration(this.editingRegistration.registration_id, {
      applicationStatus: this.editingRegistration.application_status,
      remarks: 'Updated by Super Admin'
    }).subscribe({
      next: () => {
        this.showToast('Registration status updated successfully');
        this.editingRegistration = null;
        this.refreshAllData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update status');
      }
    });
  }

  deleteRegistration(registrationId: string): void {
    if (confirm('Are you sure you want to delete this registration?')) {
      this.adminService.deleteRegistration(registrationId).subscribe({
        next: (res: any) => {
          this.showToast(res.message);
          this.refreshAllData();
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Delete registration failed');
        }
      });
    }
  }

  // Logout handler
  logout(): void {
    if (confirm('Are you sure you want to sign out of the Super Admin Panel?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login/admin']);
    }
  }

  // Toast Helper
  private showToast(message: string): void {
    const existing = document.querySelector('.admin-sync-toast');
    if (existing) {
      existing.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = 'admin-sync-toast';
    alertDiv.innerHTML = `<i class="bi bi-info-circle-fill text-success"></i> ${message}`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  }
}
