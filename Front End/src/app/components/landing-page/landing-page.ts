import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  activeSection: string = 'home';
  currentLanguage: string = 'en';
  langDropdownOpen: boolean = false;
  private observer: IntersectionObserver | null = null;

  languagesList = [
    { code: 'ar', label: 'Arabic', flag: 'https://flagcdn.com/w20/ae.png' },
    { code: 'zh-CN', label: 'Chinese', flag: 'https://flagcdn.com/w20/cn.png' },
    { code: 'en', label: 'English', flag: 'https://flagcdn.com/w20/us.png' },
    { code: 'fr', label: 'French', flag: 'https://flagcdn.com/w20/fr.png' },
    { code: 'de', label: 'German', flag: 'https://flagcdn.com/w20/de.png' },
    { code: 'te', label: 'India', flag: 'https://flagcdn.com/w20/in.png' },
    { code: 'it', label: 'Italian', flag: 'https://flagcdn.com/w20/it.png' },
    { code: 'ja', label: 'Japanese', flag: 'https://flagcdn.com/w20/jp.png' },
    { code: 'ko', label: 'Korean', flag: 'https://flagcdn.com/w20/kr.png' },
    { code: 'pt', label: 'Portuguese', flag: 'https://flagcdn.com/w20/pt.png' },
    { code: 'es', label: 'Spanish', flag: 'https://flagcdn.com/w20/es.png' }
  ];

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    const clickedInside = this.eRef.nativeElement.querySelector('.lang-select-wrapper')?.contains(event.target);
    if (!clickedInside) {
      this.langDropdownOpen = false;
    }
  }

  toggleLangDropdown(): void {
    this.langDropdownOpen = !this.langDropdownOpen;
  }

  getSelectedLangFlag(): string {
    const lang = this.languagesList.find(l => l.code === this.currentLanguage);
    return lang ? lang.flag : 'https://flagcdn.com/w20/us.png';
  }

  getSelectedLangLabel(): string {
    const lang = this.languagesList.find(l => l.code === this.currentLanguage);
    return lang ? lang.label : 'English';
  }

  activeTradingCountry: string = 'European Union (EU ETS)';
  tradingVolume: string = '$850 Billion';
  activeMarketsCount: number = 42;
  
  private tradingList = [
    { country: 'European Union', market: 'EU ETS Active (Market Cap $750B)' },
    { country: 'United States', market: 'California Cap-and-Trade Active' },
    { country: 'China', market: 'National ETS Active (Covers 4.5B Tons)' },
    { country: 'India', market: 'C-PAY Carbon Credit Bank Active' },
    { country: 'Australia', market: 'ACCUs Market Active' },
    { country: 'United Kingdom', market: 'UK ETS Active' },
    { country: 'Brazil', market: 'Amazon Bio-Carbon Credits Registered' },
    { country: 'Canada', market: 'Federal Output-Based Pricing System' }
  ];
  private tradingTimer: any;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  ngOnInit(): void {
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      const val = match[2];
      const parts = val.split('/');
      this.currentLanguage = parts[parts.length - 1] || 'en';
    } else {
      this.currentLanguage = 'en';
    }

    let idx = 0;
    this.tradingTimer = setInterval(() => {
      idx = (idx + 1) % this.tradingList.length;
      const item = this.tradingList[idx];
      this.activeTradingCountry = `${item.country} - ${item.market}`;
    }, 3000);
  }

  selectLanguage(code: string): void {
    this.currentLanguage = code;
    this.langDropdownOpen = false;
    
    if (code === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "googtrans=/en/en; path=/;";
    } else {
      document.cookie = "googtrans=/en/" + code + "; path=/;";
      document.cookie = "googtrans=/en/" + code + "; path=/; domain=" + window.location.hostname;
    }
    
    window.location.reload();
  }

  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // height of sticky navbar
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      if (this.isDestroyed) return;
      const canvas = document.getElementById('globeCanvas') as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let isVisible = true;
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isVisible = entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        this.observer.observe(canvas);
      }

      const radius = 155;
      const cameraDistance = 350;

      const resizeCanvas = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = (rect?.width || 450) * window.devicePixelRatio;
        canvas.height = (rect?.height || 450) * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const img = new Image();
      img.src = '/world_map_mask.jpg';
      
      interface GlobePoint {
        x: number;
        y: number;
        z: number;
        isTrading: boolean;
      }
      
      const points: GlobePoint[] = [];

      const hubs = [
        { name: 'USA', x: 24, y: 22 },
        { name: 'Europe', x: 58, y: 18 },
        { name: 'China', x: 90, y: 27 },
        { name: 'India', x: 78, y: 37 },
        { name: 'Australia', x: 102, y: 53 },
        { name: 'Brazil', x: 38, y: 45 }
      ];

      const connections = [
        { from: 3, to: 0 },
        { from: 3, to: 1 },
        { from: 3, to: 2 },
        { from: 3, to: 4 },
        { from: 3, to: 5 },
        { from: 1, to: 0 },
        { from: 2, to: 1 }
      ];

      const getSphereCoordsCorrect = (hub: { x: number; y: number }) => {
        const phi = (hub.y / 68) * Math.PI;
        const theta = (hub.x / 120) * 2 * Math.PI - Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        return {
          x: radius * sinPhi * Math.cos(theta),
          y: radius * cosPhi,
          z: radius * sinPhi * Math.sin(theta)
        };
      };

      img.onload = () => {
        if (this.isDestroyed) return;
        const offscreenCanvas = document.createElement('canvas');
        const offCtx = offscreenCanvas.getContext('2d');
        if (!offCtx) return;

        offscreenCanvas.width = 120;
        offscreenCanvas.height = 68;
        offCtx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

        const imgData = offCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const data = imgData.data;

        const isUSA = (x: number, y: number) => (x >= 12 && x <= 38 && y >= 14 && y <= 30);
        const isEurope = (x: number, y: number) => (x >= 52 && x <= 66 && y >= 12 && y <= 25);
        const isChina = (x: number, y: number) => (x >= 84 && x <= 96 && y >= 20 && y <= 34);
        const isIndia = (x: number, y: number) => (x >= 75 && x <= 82 && y >= 32 && y <= 42);
        const isAustralia = (x: number, y: number) => (x >= 95 && x <= 110 && y >= 46 && y <= 60);
        const isBrazil = (x: number, y: number) => (x >= 32 && x <= 45 && y >= 36 && y <= 54);

        for (let y = 0; y < offscreenCanvas.height; y++) {
          for (let x = 0; x < offscreenCanvas.width; x++) {
            const idx = (y * offscreenCanvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            if (r > 120 && g > 120 && b > 120) {
              const phi = (y / offscreenCanvas.height) * Math.PI;
              const theta = (x / offscreenCanvas.width) * 2 * Math.PI - Math.PI;

              const sinPhi = Math.sin(phi);
              const cosPhi = Math.cos(phi);
              const cosTheta = Math.cos(theta);
              const sinTheta = Math.sin(theta);

              const px = radius * sinPhi * cosTheta;
              const py = radius * cosPhi;
              const pz = radius * sinPhi * sinTheta;

              const isTrading = isUSA(x, y) || isEurope(x, y) || isChina(x, y) || isIndia(x, y) || isAustralia(x, y) || isBrazil(x, y);

              points.push({ x: px, y: py, z: pz, isTrading });
            }
          }
        }
      };

      let angle = 0;
      const speed = 0.0035;

      const rotateWithTilt = (pt: { x: number; y: number; z: number }, cosA: number, sinA: number) => {
        const rx1 = pt.x * cosA - pt.z * sinA;
        const ry1 = pt.y;
        const rz1 = pt.x * sinA + pt.z * cosA;

        const tilt = 0.4;
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);
        
        return {
          x: rx1 * cosT - ry1 * sinT,
          y: rx1 * sinT + ry1 * cosT,
          z: rz1
        };
      };

      const animate = () => {
        if (this.isDestroyed || !ctx || !canvas) return;
        
        if (isVisible) {
          const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 0;

        const cx = width / 2;
        const cy = height / 2;

        angle += speed;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        ctx.beginPath();
        ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
        const glowGrad = ctx.createRadialGradient(cx, cy, radius - 5, cx, cy, radius + 8);
        glowGrad.addColorStop(0, 'rgba(0, 164, 153, 0.0)');
        glowGrad.addColorStop(0.6, 'rgba(0, 164, 153, 0.12)');
        glowGrad.addColorStop(1, 'rgba(0, 164, 153, 0.0)');
        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = 6;
        ctx.stroke();

        points.forEach(p => {
          const r = rotateWithTilt(p, cosA, sinA);

          const scale = cameraDistance / (cameraDistance + r.z);
          const screenX = cx + r.x * scale;
          const screenY = cy + r.y * scale;

          const alpha = (r.z + radius) / (2 * radius);
          
          if (r.z < -radius * 0.9) return;

          ctx.beginPath();
          const size = alpha * 2.2 + 0.8;
          ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);

          if (p.isTrading) {
            ctx.fillStyle = `rgba(255, 193, 7, ${alpha * 0.95})`;
            ctx.shadowColor = 'rgba(255, 193, 7, 0.5)';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(180, 230, 215, ${alpha * 0.45})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        });

        ctx.shadowBlur = 0;

        connections.forEach(conn => {
          const h1 = hubs[conn.from];
          const h2 = hubs[conn.to];

          const p1 = getSphereCoordsCorrect(h1);
          const p2 = getSphereCoordsCorrect(h2);

          const r1 = rotateWithTilt(p1, cosA, sinA);
          const r2 = rotateWithTilt(p2, cosA, sinA);

          if (r1.z < 0 && r2.z < 0) return;

          ctx.beginPath();
          const segments = 20;
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            
            let ix = r1.x + (r2.x - r1.x) * t;
            let iy = r1.y + (r2.y - r1.y) * t;
            let iz = r1.z + (r2.z - r1.z) * t;

            const dist = Math.sqrt(ix*ix + iy*iy + iz*iz);
            const bowHeight = 35 * Math.sin(t * Math.PI);
            const targetDist = radius + bowHeight;

            ix = (ix / dist) * targetDist;
            iy = (iy / dist) * targetDist;
            iz = (iz / dist) * targetDist;

            const scale = cameraDistance / (cameraDistance + iz);
            const sx = cx + ix * scale;
            const sy = cy + iy * scale;

            if (i === 0) {
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }

          ctx.strokeStyle = 'rgba(0, 164, 153, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          const tProgress = ((Date.now() / 2000) + conn.from * 0.25) % 1.0;
          let px = r1.x + (r2.x - r1.x) * tProgress;
          let py = r1.y + (r2.y - r1.y) * tProgress;
          let pz = r1.z + (r2.z - r1.z) * tProgress;

          const pDist = Math.sqrt(px*px + py*py + pz*pz);
          const bow = 35 * Math.sin(tProgress * Math.PI);
          const target = radius + bow;

          px = (px / pDist) * target;
          py = (py / pDist) * target;
          pz = (pz / pDist) * target;

          const pScale = cameraDistance / (cameraDistance + pz);
          const psx = cx + px * pScale;
          const psy = cy + py * pScale;

          if (pz > -radius * 0.8) {
            ctx.beginPath();
            ctx.arc(psx, psy, 3.2, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        hubs.forEach(hub => {
          const p = getSphereCoordsCorrect(hub);
          const r = rotateWithTilt(p, cosA, sinA);

          if (r.z < -radius * 0.8) return;

          const scale = cameraDistance / (cameraDistance + r.z);
          const sx = cx + r.x * scale;
          const sy = cy + r.y * scale;

          const alpha = (r.z + radius) / (2 * radius);
          const pulse = 4 + Math.sin(Date.now() / 200) * 3;

          ctx.beginPath();
          ctx.arc(sx, sy, pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(255, 193, 7, ${alpha * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(255, 193, 7, ${alpha * 0.95})`;
          ctx.fill();
        });
        }

        this.animFrameId = requestAnimationFrame(animate);
      };

      animate();
    }, 20);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.tradingTimer) {
      clearInterval(this.tradingTimer);
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
