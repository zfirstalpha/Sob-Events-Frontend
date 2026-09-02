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
  }
];