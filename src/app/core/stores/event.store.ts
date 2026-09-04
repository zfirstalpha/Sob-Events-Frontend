import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, concatMap, switchMap, catchError, of } from 'rxjs';
import { Event, CreateEventRequest, PagedRequest } from '../models';
import { EventService } from '../services/event';

// MODULE 6 & 9: Complete Pagination State Interface
interface EventState {
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const initialState: EventState = {
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 6, // 6 events per page fits a 3-column grid cleanly!
  totalPages: 1,
  hasPrevious: false,
  hasNext: false
};

export const EventStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Event>(),
  withComputed((store) => ({
    publishedCount: computed(() => store.entities().filter(e => e.status === 'Published').length),
    draftCount: computed(() => store.entities().filter(e => e.status === 'Draft').length),
    // Array of page numbers [1, 2, 3...] for rendering numeric pagination buttons
    pageNumbers: computed(() => Array.from({ length: store.totalPages() }, (_, i) => i + 1))
  })),
  withMethods((store, eventService = inject(EventService)) => ({
    
    // 1. Load Public Catalog Events (with full pagination sync)
    loadEvents: rxMethod<PagedRequest | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((req) => {
          const request: PagedRequest = {
            page: req?.page ?? store.currentPage(),
            pageSize: req?.pageSize ?? store.pageSize(),
            search: req?.search
          };

          return eventService.getEvents(request).pipe(
            tap((res) => {
              patchState(
                store,
                setAllEntities(res.items),
                {
                  totalCount: res.totalCount,
                  currentPage: res.page,
                  pageSize: res.pageSize,
                  totalPages: res.totalPages,
                  hasPrevious: res.hasPrevious,
                  hasNext: res.hasNext,
                  isLoading: false
                }
              );
            }),
            catchError((err) => {
              patchState(store, { isLoading: false, error: err.error?.detail || 'Failed to load events.' });
              return of(null);
            })
          );
        })
      )
    ),

    // 2. Load Organizer Isolated Events
    loadOrganizerEvents: rxMethod<PagedRequest | void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((req) => eventService.getOrganizerEvents(req || {}).pipe(
          tap((res) => {
            patchState(
              store,
              setAllEntities(res.items),
              {
                totalCount: res.totalCount,
                currentPage: res.page,
                pageSize: res.pageSize,
                totalPages: res.totalPages,
                hasPrevious: res.hasPrevious,
                hasNext: res.hasNext,
                isLoading: false
              }
            );
          }),
          catchError((err) => {
            patchState(store, { isLoading: false, error: err.error?.detail || 'Failed to load organizer events.' });
            return of(null);
          })
        ))
      )
    ),

    // 3. Pagination Actions
    nextPage(search?: string) {
      if (store.hasNext()) {
        const next = store.currentPage() + 1;
        this.loadEvents({ page: next, pageSize: store.pageSize(), search });
      }
    },

    previousPage(search?: string) {
      if (store.hasPrevious()) {
        const prev = store.currentPage() - 1;
        this.loadEvents({ page: prev, pageSize: store.pageSize(), search });
      }
    },

    goToPage(page: number, search?: string) {
      if (page >= 1 && page <= store.totalPages() && page !== store.currentPage()) {
        this.loadEvents({ page, pageSize: store.pageSize(), search });
      }
    },

    createEvent: rxMethod<{ 
      request: CreateEventRequest; 
      onSuccess: () => void; 
      onError: (errorMsg: string) => void; 
    }>(
      pipe(
        concatMap(({ request, onSuccess, onError }) => eventService.createEvent(request).pipe(
          tap((newEvent) => {
            patchState(store, addEntity(newEvent), { totalCount: store.totalCount() + 1 });
            onSuccess();
          }),
          catchError((err) => {
            const errorMsg = err.status === 401
              ? 'Authentication required. Please sign in as an Organizer.'
              : err.error?.detail || 'Failed to create event.';
            patchState(store, { error: errorMsg });
            onError(errorMsg);
            return of(null);
          })
        ))
      )
    ),

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