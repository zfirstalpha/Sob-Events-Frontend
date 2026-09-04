import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../../../core/services/reservation';
import { Event, Reservation } from '../../../../core/models';

@Component({
  selector: 'app-event-approvals-dialog',
  standalone: true,
  imports: [DatePipe, MatDialogModule],
  templateUrl: './event-approvals-dialog.html',
  styleUrl: './event-approvals-dialog.scss'
})
export class EventApprovalsDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EventApprovalsDialogComponent>);
  public data: { event: Event } = inject(MAT_DIALOG_DATA);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);

  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.isLoading.set(true);
    this.reservationService.getEventReservations(this.data.event.id).subscribe({
      next: (res) => {
        this.reservations.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // MODULE 9 SESSION 1 SLIDE 10: Optimistic Approve Action
  onApprove(reservationId: number) {
    this.reservationService.approveReservation(reservationId).subscribe({
      next: () => {
        this.snackBar.open('Payment verified! Attendee ticket confirmed.', 'Dismiss', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to approve reservation.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  // Reject Action (Frees capacity & broadcasts SignalR update!)
  onReject(reservationId: number) {
    const reason = prompt('Enter a rejection reason for the attendee (optional):', 'Invalid transaction ID');
    if (reason === null) return; // User cancelled prompt

    this.reservationService.rejectReservation(reservationId, { reason }).subscribe({
      next: () => {
        this.snackBar.open('Reservation rejected. Seats returned to public capacity.', 'Dismiss', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to reject reservation.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}