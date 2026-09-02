import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },

  // Catalog Page
  {
    path: 'events',
    loadComponent: () => import('./features/events/pages/event-catalog/event-catalog')
      .then(m => m.EventCatalogComponent)
  },

  // Event Detail Page
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/pages/event-detail/event-detail')
      .then(m => m.EventDetailComponent)
  },

  // Organizer Management Page
  {
    path: 'organizer/events',
    loadComponent: () => import('./features/organizer/pages/organizer-events/organizer-events')
      .then(m => m.OrganizerEventsComponent)
  },

  // Attendee Bookings Portal
  {
    path: 'my-reservations',
    loadComponent: () => import('./features/reservations/pages/my-reservations/my-reservations')
      .then(m => m.MyReservationsComponent)
  }
];