import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('apccb-frontend');

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('wheel', (e: WheelEvent) => {
        const active = document.activeElement as HTMLInputElement;
        if (active && active.tagName === 'INPUT' && active.type === 'number') {
          active.blur();
        }
      }, { passive: true });
    }
  }
}
