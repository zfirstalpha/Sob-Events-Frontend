import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EventStore } from '../../../../core/stores/event.store';

@Component({
  selector: 'app-organizer-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatTableModule, MatPaginatorModule],
  templateUrl: './organizer-events.html',
  styleUrl: './organizer-events.scss'
})
export class OrganizerEventsComponent implements OnInit {
  // Inject the global EventStore
  readonly eventStore = inject(EventStore);

  displayedColumns: string[] = ['name', 'location', 'dates', 'status', 'actions'];
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const page = this.pageIndex() + 1;
    this.eventStore.loadEvents({ page, pageSize: this.pageSize() });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEvents();
  }

  onPublish(id: number) {
    this.eventStore.publishEvent(id);
  }

  onDelete(id: number) {
    if (!confirm('Are you sure you want to soft-delete this event?')) return;
    this.eventStore.deleteEvent(id);
  }
}