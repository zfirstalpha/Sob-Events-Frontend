import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

//  Functional route guard for logged-in users
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Redirect to login if unauthenticated
  return router.createUrlTree(['/login']);
};

//Functional guard strictly requiring Organizer role
export const organizerGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated() && authStore.isOrganizer()) {
    return true;
  }

 
  return router.createUrlTree(['/events']);
};