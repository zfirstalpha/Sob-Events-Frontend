import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketType } from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  //fetch ticket
  getTicketTypesByEvent(eventId: number | string): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(`${this.apiUrl}/events/${eventId}/tickets`);
  }
}