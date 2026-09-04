import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationStore } from '../../../../core/stores/reservation.store';
import { ReservationService } from '../../../../core/services/reservation';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservationsComponent implements OnInit {
  readonly reservationStore = inject(ReservationStore);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);

  // Map tracking active transaction input text per reservation card
  txInputs = signal<Record<number, string>>({});

  ngOnInit() {
    this.reservationStore.loadMyReservations();
  }

  onTxChange(id: number, value: string) {
    this.txInputs.update(map => ({ ...map, [id]: value }));
  }

  onSubmitTx(id: number) {
    const tx = this.txInputs()[id]?.trim();
    if (!tx) {
      this.snackBar.open('Please enter your Bank or Telebirr Transaction ID.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.reservationService.submitPaymentProof(id, { transactionReference: tx }).subscribe({
      next: () => {
        this.snackBar.open('Payment proof submitted! The organizer is verifying your payment.', 'Dismiss', { duration: 4000 });
        this.reservationStore.loadMyReservations(); // Refresh state
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to submit transaction reference.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  onCancelBooking(id: number) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    this.reservationStore.cancelReservationOptimistic(id);
  }

  onDispatchTickets(id: number) {
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