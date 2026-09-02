import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketType, CreateTicketTypeRequest, UpdateTicketTypeRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. GET ALL TICKETS FOR EVENT
  getTicketTypesByEvent(eventId: number | string): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(`${this.apiUrl}/events/${eventId}/tickets`);
  }

  // 2. GET TICKET BY ID
  getTicketTypeById(eventId: number | string, id: number | string): Observable<TicketType> {
    return this.http.get<TicketType>(`${this.apiUrl}/events/${eventId}/tickets/${id}`);
  }

  // 3. CREATE TICKET TIER (Organizer)
  createTicketType(eventId: number | string, request: CreateTicketTypeRequest): Observable<TicketType> {
    return this.http.post<TicketType>(`${this.apiUrl}/events/${eventId}/tickets`, request);
  }

  // 4. UPDATE TICKET TIER (Organizer)
  updateTicketType(eventId: number | string, id: number | string, request: UpdateTicketTypeRequest): Observable<TicketType> {
    return this.http.put<TicketType>(`${this.apiUrl}/events/${eventId}/tickets/${id}`, request);
  }

  // 5. DELETE TICKET TIER (Organizer)
  deleteTicketType(eventId: number | string, id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}/tickets/${id}`);
  }
}