import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, concatMap, switchMap, catchError, of } from 'rxjs';
import { Event, PagedRequest } from '../models';
import { EventService } from '../services/event';

interface EventState {
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: EventState = {
  isLoading: false,
  error: null,
  totalCount: 0
};

// Complete SignalStore with Entities, State, Computed & Methods
export const EventStore = signalStore(
  { providedIn: 'root' },
  
  // 1. Loading and Error State
  withState(initialState),

  // 2. Dictionary-backed O(1) Entity Storage 
  withEntities<Event>(),

  // 3. Derived Computed Signals
  withComputed((store) => ({
    publishedCount: computed(() => store.entities().filter(e => e.status === 'Published').length),
    draftCount: computed(() => store.entities().filter(e => e.status === 'Draft').length)
  })),

  // 4. Reactive API Methods 
  withMethods((store, eventService = inject(EventService)) => ({
    
    // Loads events safely via rxMethod
    loadEvents: rxMethod<PagedRequest | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((req) => eventService.getEvents(req || {}).pipe(
          tap((res) => {
            patchState(
              store,
              setAllEntities(res.items), // Populates O(1) dictionary
              { totalCount: res.totalCount, isLoading: false }
            );
          }),
          catchError((err) => {
            patchState(store, { isLoading: false, error: err.error?.detail || 'Failed to load events.' });
            return of(null);
          })
        ))
      )
    ),

    // Publishes a draft event and patches state immediately
    publishEvent: rxMethod<number>(
      pipe(
        concatMap((id) => eventService.publishEvent(id).pipe(
          tap(() => {
            patchState(store, updateEntity({ id, changes: { status: 'Published' } }));
          }),
          catchError((err) => {
            patchState(store, { error: err.error?.detail || 'Failed to publish event.' });
            return of(null);
          })
        ))
      )
    ),

    // Soft-deletes an event and removes it from the store
    deleteEvent: rxMethod<number>(
      pipe(
        concatMap((id) => eventService.deleteEvent(id).pipe(
          tap(() => {
            patchState(store, removeEntity(id));
          }),
          catchError((err) => {
            patchState(store, { error: err.error?.detail || 'Failed to delete event.' });
            return of(null);
          })
        ))
      )
    )

  }))
);