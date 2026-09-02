import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EventService } from '../../../../core/services/event';
import { Event } from '../../../../core/models';

@Component({
  selector: 'app-organizer-events',
  standalone: true,
  // MODULE 9 SESSION 2 SLIDE 7: OnPush stops grid-wide repaint storms on keystrokes!
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatTableModule, MatPaginatorModule],
  templateUrl: './organizer-events.html',
  styleUrl: './organizer-events.scss'
})
export class OrganizerEventsComponent implements OnInit {
  private eventService = inject(EventService);

  // Table columns to display in order
  displayedColumns: string[] = ['name', 'location', 'dates', 'status', 'actions'];

  // Reactive state signals
  events = signal<Event[]>([]);
  totalCount = signal<number>(0);
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    const page = this.pageIndex() + 1; // Backend pagination is 1-indexed

    this.eventService.getEvents({ page, pageSize: this.pageSize() }).subscribe({
      next: (res) => {
        this.events.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEvents();
  }

  onPublish(id: number) {
    if (!confirm('Are you sure you want to publish this event to attendees?')) return;

    this.eventService.publishEvent(id).subscribe({
      next: () => this.loadEvents(),
      error: (err) => alert(err.error?.detail || 'Failed to publish event.')
    });
  }

  onDelete(id: number) {
    if (!confirm('Are you sure you want to soft-delete this event?')) return;

    this.eventService.deleteEvent(id).subscribe({
      next: () => this.loadEvents(),
      error: (err) => alert(err.error?.detail || 'Failed to delete event.')
    });
  }
}