import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  {
    path: 'events',
    loadComponent:()=> import('./features/events/pages/event-catalog/event-catalog').then(m=>m.EventCatalogComponent)
  }
];