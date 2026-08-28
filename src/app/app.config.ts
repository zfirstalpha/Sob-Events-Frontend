import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // MODULE 8 SESSION 1 SLIDE 8: Pure Zoneless Change Detection with Signals!
    provideZonelessChangeDetection(),

    // Automatically binds :id from route to component inputs (Module 8 Slide 13)
    provideRouter(routes, withComponentInputBinding()),

    // HTTP client for backend communication
    provideHttpClient(),

    // Async animations provider for Angular Material
    provideAnimationsAsync()
  ]
};