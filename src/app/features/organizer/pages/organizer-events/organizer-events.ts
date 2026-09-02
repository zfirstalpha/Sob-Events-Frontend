import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Add this using
import { EventStore } from '../../../../core/stores/event.store';
import { CreateEventDialogComponent } from '../../components/create-event-dialog/create-event-dialog'; // Add this import

@Component({
  selector: 'app-organizer-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatTableModule, MatPaginatorModule, MatDialogModule],
  templateUrl: './organizer-events.html',
  styleUrl: './organizer-events.scss'
})
export class OrganizerEventsComponent implements OnInit {
  readonly eventStore = inject(EventStore);
  private dialog = inject(MatDialog); // Injected MatDialog service

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

  // Opens the Event Creator Modal
  openCreateDialog() {
    this.dialog.open(CreateEventDialogComponent, {
      width: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  onPublish(id: number) {
    this.eventStore.publishEvent(id);
  }

  onDelete(id: number) {
    if (!confirm('Are you sure you want to soft-delete this event?')) return;
    this.eventStore.deleteEvent(id);
  }
}