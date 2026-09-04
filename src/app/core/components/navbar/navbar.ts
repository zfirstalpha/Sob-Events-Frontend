import { Component, inject, signal } from '@angular/core';
import {Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Theme } from '../../services/theme';
import { AuthStore } from '../../stores/auth.store'; 
import { EventStore } from '../../stores/event.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private router = inject(Router);
  themeService = inject(Theme);
  readonly authStore = inject(AuthStore);
  readonly eventStore = inject(EventStore); 
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

   onHeaderSearch(event: globalThis.KeyboardEvent) {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const query = input.value.trim();
      this.router.navigate(['/events']);
      this.eventStore.loadEvents({ page: 1, search: query });
    }
  }
}