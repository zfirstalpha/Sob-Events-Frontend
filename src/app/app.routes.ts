import { Routes } from '@angular/router';
import { authGuard, organizerGuard } from './core/guards/auth.guard';
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
    canActivate: [organizerGuard],
    loadComponent: () => import('./features/organizer/pages/organizer-events/organizer-events')
      .then(m => m.OrganizerEventsComponent)
  },

  // Attendee Bookings Portal
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservations/pages/my-reservations/my-reservations')
      .then(m => m.MyReservationsComponent)
  },
   {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register')
      .then(m => m.RegisterComponent)
  }
];