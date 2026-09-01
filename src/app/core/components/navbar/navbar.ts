import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {Theme} from '../../services/theme';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent{
  themeService = inject(Theme);
  mobileMenuOpen =signal(false);//zonless signal to track mobile menu

  toggleMobileMenu(){
    this.mobileMenuOpen.update(open => !open);
  }
  closeMobileMenu(){
    this.mobileMenuOpen.set(false);
  }
}