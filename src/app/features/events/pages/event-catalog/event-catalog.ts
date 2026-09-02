import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventCard } from '../../components/event-card/event-card';
import { EventStore } from '../../../../core/stores/event.store';
import { Event } from '../../../../core/models';

@Component({
  selector: 'app-event-catalog',
  standalone: true,
  imports: [EventCard],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.scss'
})
export class EventCatalogComponent implements OnInit {
  // MODULE 9 SESSION 1: Inject Global SignalStore as single source of truth!
  readonly eventStore = inject(EventStore);
  private router = inject(Router);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  categories = ['All', 'Technology', 'Conferences', 'Music & Concerts', 'Business', 'Workshops'];

  ngOnInit() {
    // Initial load from store
    this.eventStore.loadEvents();
  }

  onSearchChange(event: globalThis.Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.eventStore.loadEvents({ search: value, pageSize: 12 });
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    if (category === 'All') {
      this.eventStore.loadEvents({ pageSize: 12 });
    } else {
      this.eventStore.loadEvents({ search: category, pageSize: 12 });
    }
  }

  onBookEvent(event: Event) {
    this.router.navigate(['/events', event.id]);
  }
}