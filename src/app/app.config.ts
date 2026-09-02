import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),

    
    provideHttpClient(withInterceptors([errorInterceptor])),

    provideAnimationsAsync(),
   
    
  ]
};