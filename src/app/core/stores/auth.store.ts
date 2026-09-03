import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { UserDto, LoginRequest, RegisterRequest } from '../models';
import { AuthService } from '../services/auth';

interface AuthState {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // true on startup while checking /me
  error: null
};


export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.user() !== null),
    isOrganizer: computed(() => store.user()?.role === 'Organizer'),
    isAttendee: computed(() => store.user()?.role === 'Attendee')
  })),
  withMethods((
    store,
    authService = inject(AuthService),
    router = inject(Router)
  ) => ({
    
    // 1. Checks session on application startup via GET /api/v1/auth/me
    initializeSession() {
      patchState(store, { isLoading: true });

      authService.getMe().subscribe({
        next: (user) => {
          patchState(store, { user, isLoading: false, error: null });
        },
        error: () => {
          // If /me returns 401, attempt silent cookie refresh!
          authService.refresh().subscribe({
            next: (user) => {
              patchState(store, { user, isLoading: false, error: null });
            },
            error: () => {
              patchState(store, { user: null, isLoading: false });
            }
          });
        }
      });
    },

    login(credentials: LoginRequest, onSuccess?: () => void, onError?: (err: string) => void) {
      patchState(store, { isLoading: true, error: null });

      authService.login(credentials).subscribe({
        next: (user) => {
          patchState(store, { user, isLoading: false, error: null });
          if (onSuccess) onSuccess();
          if (user.role === 'Organizer') {
            router.navigate(['/organizer/events']);
          } else {
            router.navigate(['/events']);
          }
        },
        error: (err) => {
          const errorMsg = err.error?.detail || err.error?.title || 'Invalid email or password.';
          patchState(store, { isLoading: false, error: errorMsg });
          if (onError) onError(errorMsg);
        }
      });
    },

    register(data: RegisterRequest, onSuccess?: () => void, onError?: (err: string) => void) {
      patchState(store, { isLoading: true, error: null });

      authService.register(data).subscribe({
        next: (user) => {
          patchState(store, { user, isLoading: false, error: null });
          if (onSuccess) onSuccess();
          router.navigate(['/events']);
        },
        error: (err) => {
          const errorMsg = err.error?.detail || err.error?.title || 'Registration failed.';
          patchState(store, { isLoading: false, error: errorMsg });
          if (onError) onError(errorMsg);
        }
      });
    },

    setUser(user: UserDto | null) {
      patchState(store, { user, isLoading: false });
    },

    logout() {
      authService.logout().subscribe({
        next: () => {
          patchState(store, { user: null, isLoading: false });
          router.navigate(['/login']);
        }
      });
    }

  }))
);