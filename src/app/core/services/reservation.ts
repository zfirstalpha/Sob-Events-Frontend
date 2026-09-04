import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationRequest, SubmitPaymentProofRequest, RejectReservationRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createReservation(ticketTypeId: number | string, request: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/tickets/${ticketTypeId}/reservations`, request);
  }

  getReservationById(id: number | string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/reservations/${id}`);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/my-reservations`);
  }

  // 1. ATTENDEE: Submit CBE / Telebirr Transaction ID
  submitPaymentProof(id: number | string, request: SubmitPaymentProofRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reservations/${id}/submit-payment`, request);
  }

  // 2. ORGANIZER: View event attendee approvals
  getEventReservations(eventId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/events/${eventId}/reservations`);
  }

  // 3. ORGANIZER: Approve
  approveReservation(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reservations/${id}/approve`, {});
  }

  // 4. ORGANIZER: Reject
  rejectReservation(id: number | string, request?: RejectReservationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reservations/${id}/reject`, request || {});
  }

  cancelReservation(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${id}`);
  }

  sendTickets(id: number | string): Observable<{ message: string; jobId: string; status: string }> {
    return this.http.post<{ message: string; jobId: string; status: string }>(
      `${this.apiUrl}/reservations/${id}/send-tickets`, {}
    );
  }
}