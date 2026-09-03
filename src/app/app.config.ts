import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { EventService } from './core/services/event';
import {credentialsInterceptor} from './core/interceptors/credentials.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),

    
    provideHttpClient(
      withInterceptors([errorInterceptor, credentialsInterceptor]),

    withXsrfConfiguration({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
     }) ,)
   
    
  ]
};