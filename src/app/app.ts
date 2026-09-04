import { Component, OnInit ,inject , OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar';
import { Footer } from './core/components/footer/footer';
import { SignalrService } from './core/services/signalr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private signalrService = inject(SignalrService);

  ngOnInit() {
    
    this.signalrService.startConnection();
  }

  ngOnDestroy() {
    this.signalrService.stopConnection();
  }
}