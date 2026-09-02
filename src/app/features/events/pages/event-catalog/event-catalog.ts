import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  readonly eventStore = inject(EventStore);
  private router = inject(Router);

  // MODULE 9 SESSION 3 SLIDE 7: Subject stream for defensive typeahead search
  private searchSubject$ = new Subject<string>();

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  categories = ['All', 'Technology', 'Conferences', 'Music & Concerts', 'Business', 'Workshops'];

  constructor() {
    // MODULE 9 SESSION 3 SLIDE 7: Defensive RxJS Stream Pipeline
    this.searchSubject$.pipe(
      debounceTime(300),          // 1. Debounce: Wait 300ms for user to pause
      distinctUntilChanged(),     // 2. Ignore duplicate values
      takeUntilDestroyed()        // 3. Prevent memory leaks on component destruction
    ).subscribe((query) => {
      this.searchQuery.set(query);
      // Calls EventStore's rxMethod (which uses switchMap internally to cancel stale HTTP calls!)
      this.eventStore.loadEvents({ search: query, pageSize: 12 });
    });
  }

  ngOnInit() {
    this.eventStore.loadEvents({ pageSize: 12 });
  }

  // Pushes raw keystrokes into our Subject stream (Zero naked subscriptions inside handler!)
  onSearchInput(event: globalThis.Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
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