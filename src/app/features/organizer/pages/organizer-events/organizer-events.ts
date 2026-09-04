import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventStore } from '../../../../core/stores/event.store';
import { Event } from '../../../../core/models';
import { CreateEventDialogComponent } from '../../components/create-event-dialog/create-event-dialog';
import { ManageTicketsDialogComponent } from '../../components/manage-tickets-dialog/manage-tickets-dialog'; 
import { EventApprovalsDialogComponent } from '../../components/event-approvals-dialog/event-approvals-dialog';

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
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'location', 'dates', 'status', 'actions'];
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const page = this.pageIndex() + 1;
    // MODULE 10: Calls loadOrganizerEvents() to see ONLY this organizer's events!
    this.eventStore.loadOrganizerEvents({ page, pageSize: this.pageSize() });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEvents();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe((created) => {
      if (created) this.loadEvents();
    });
  }

  // Opens the Manage Tickets Modal for the specific event
  openTicketsDialog(event: Event) {
    const dialogRef = this.dialog.open(ManageTicketsDialogComponent, {
      width: '650px',
      data: { event }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadEvents();
    });
  }

  onPublish(id: number) {
    this.eventStore.publishEvent(id);
  }

  onDelete(id: number) {
    if (!confirm('Are you sure you want to soft-delete this event?')) return;
    this.eventStore.deleteEvent(id);
  }

  openApprovalsDialog(event: Event) {
  this.dialog.open(EventApprovalsDialogComponent, {
    width: '750px',
    data: { event }
  });
}
}