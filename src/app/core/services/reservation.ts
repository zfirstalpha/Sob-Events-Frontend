import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. RESERVE TICKETS (15-Minute Hold)
  createReservation(ticketTypeId: number | string, request: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/tickets/${ticketTypeId}/reservations`, request);
  }

  // 2. GET RESERVATION BY ID
  getReservationById(id: number | string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/reservations/${id}`);
  }

  // 3. GET ATTENDEE BOOKINGS
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/my-reservations`);
  }

  // 4. CANCEL RESERVATION
  cancelReservation(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${id}`);
  }

  // 5. DISPATCH TICKETS VIA BACKGROUND CHANNEL
  sendTickets(id: number | string): Observable<{ message: string; jobId: string; status: string }> {
    return this.http.post<{ message: string; jobId: string; status: string }>(
      `${this.apiUrl}/reservations/${id}/send-tickets`, {}
    );
  }
}