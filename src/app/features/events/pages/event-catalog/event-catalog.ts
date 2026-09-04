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

  private searchSubject$ = new Subject<string>();

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  categories = ['All', 'Technology', 'Conferences', 'Music & Concerts', 'Business', 'Workshops'];

  constructor() {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe((query) => {
      this.searchQuery.set(query);
      this.eventStore.loadEvents({ page: 1, search: query });
    });
  }

  ngOnInit() {
    this.eventStore.loadEvents({ page: 1 });
  }

  onSearchInput(event: globalThis.Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    if (category === 'All') {
      this.eventStore.loadEvents({ page: 1 });
    } else {
      this.eventStore.loadEvents({ page: 1, search: category });
    }
  }

  onNext() {
    this.eventStore.nextPage(this.searchQuery());
  }

  onPrev() {
    this.eventStore.previousPage(this.searchQuery());
  }

  onGoTo(page: number) {
    this.eventStore.goToPage(page, this.searchQuery());
  }

  onBookEvent(event: Event) {
    this.router.navigate(['/events', event.id]);
  }
}