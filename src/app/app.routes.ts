import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  {
    path: 'events',
    loadComponent:()=> import('./features/events/pages/event-catalog/event-catalog').then(m=>m.EventCatalogComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/pages/event-detail/event-detail')
      .then(m => m.EventDetailComponent)
  },
  {
    path: 'organizer/events',
    loadComponent: () => import('./features/organizer/pages/organizer-events/organizer-events')
      .then(m => m.OrganizerEventsComponent)
  }
];