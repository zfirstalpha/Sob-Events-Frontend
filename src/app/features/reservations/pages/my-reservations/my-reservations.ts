import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationStore } from '../../../../core/stores/reservation.store';
import { ReservationService } from '../../../../core/services/reservation';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [DatePipe, RouterLink, MatSnackBarModule],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservationsComponent implements OnInit {
  readonly reservationStore = inject(ReservationStore);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.reservationStore.loadMyReservations();
  }

  onCancelBooking(id: number) {
    if (!confirm('Are you sure you want to cancel this reservation and release your seats?')) return;
    // MODULE 10 SESSION 3: Triggers optimistic cancellation with rollback safety!
    this.reservationStore.cancelReservationOptimistic(id);
  }

  onDispatchTickets(id: number) {
    // MODULE 7 SESSION 2: Triggers the 202 Accepted Background Channel worker!
    this.reservationService.sendTickets(id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Dismiss', { duration: 4000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to dispatch tickets.', 'Dismiss', { duration: 4000 });
      }
    });
  }
}