import { Component, OnInit ,inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar';
import { Footer } from './core/components/footer/footer';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.initializeSession();
  }
}