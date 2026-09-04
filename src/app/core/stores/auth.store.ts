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
  isLoading: false,
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

    setUser(user: UserDto | null) {
      patchState(store, { user, isLoading: false, error: null });
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