import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { EventService } from './core/services/event';

export const appConfig: ApplicationConfig = {
  providers: [
    //Pure Zoneless Change Detection with Signals!
    provideZonelessChangeDetection(),

    // Automatically binds :id from route to component inputs 
    provideRouter(routes, withComponentInputBinding()),

    // HTTP client for backend communication
    provideHttpClient(),

    // Async animations provider for Angular Material
    provideAnimationsAsync(),
   
    
  ]
};