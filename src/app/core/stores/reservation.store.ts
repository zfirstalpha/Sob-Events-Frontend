import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { Reservation } from '../models';
import { ReservationService } from '../services/reservation';

interface ReservationState {
  activeHold: Reservation | null;
  holdSecondsRemaining: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  activeHold: null,
  holdSecondsRemaining: 0,
  isLoading: false,
  error: null
};

export const ReservationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Reservation>(),
  withComputed((store) => ({
    // Derived computed state for active countdown
    hasActiveHold: computed(() => store.activeHold() !== null && store.holdSecondsRemaining() > 0),
    formattedTimer: computed(() => {
      const totalSec = store.holdSecondsRemaining();
      if (totalSec <= 0) return '00:00';
      const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
      const secs = (totalSec % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    })
  })),
  withMethods((store, reservationService = inject(ReservationService)) => {
    let timerInterval: any = null;

    // Starts live 1-second countdown ticker for the 15-minute hold
    const startCountdown = (expiryDateString: string) => {
      if (timerInterval) clearInterval(timerInterval);

      const updateTimer = () => {
        const diffMs = new Date(expiryDateString).getTime() - new Date().getTime();
        const diffSec = Math.max(0, Math.floor(diffMs / 1000));
        patchState(store, { holdSecondsRemaining: diffSec });

        if (diffSec <= 0) {
          clearInterval(timerInterval);
          patchState(store, { activeHold: null, error: 'Your 15-minute reservation hold has expired.' });
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    };

    return {
      setActiveHold(reservation: Reservation) {
        patchState(store, { activeHold: reservation, error: null });
        patchState(store, addEntity(reservation));
        startCountdown(reservation.expiryDate);
      },

      loadMyReservations: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => reservationService.getMyReservations().pipe(
            tap((items) => {
              patchState(store, setAllEntities(items), { isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: err.error?.detail || 'Failed to load bookings.' });
              return of(null);
            })
          ))
        )
      ),

      clearHold() {
        if (timerInterval) clearInterval(timerInterval);
        patchState(store, { activeHold: null, holdSecondsRemaining: 0 });
      }
    };
  })
);