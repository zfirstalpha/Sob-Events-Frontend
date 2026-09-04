import { ApplicationConfig, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';

import { firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { routes } from './app.routes';
import { EventService } from './core/services/event';
import { AuthService } from './core/services/auth';
import { AuthStore } from './core/stores/auth.store';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),

    
    provideHttpClient(
      withInterceptors([errorInterceptor, credentialsInterceptor]),

    withXsrfConfiguration({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
     }) ,),
   
    

      provideAppInitializer(() => {
      const authService = inject(AuthService);
      const authStore = inject(AuthStore);

      return firstValueFrom(
        authService.getMe().pipe(
          tap((user) => authStore.setUser(user)),
          catchError(() => {
            // If /me 401s, attempt silent refresh using HttpOnly cookie
            return authService.refresh().pipe(
              tap((user) => authStore.setUser(user)),
              catchError(() => {
                authStore.setUser(null);
                return of(null);
              })
            );
          })
        )
      );
    }),
     
  ]
};