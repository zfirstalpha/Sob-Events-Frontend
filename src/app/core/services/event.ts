import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, PagedRequest, PagedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;

  //  GET ALL (Paginated)
  getEvents(request?: PagedRequest): Observable<PagedResponse<Event>> {
    let params = new HttpParams();
    if (request?.page) params = params.set('page', request.page.toString());
    if (request?.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request?.search) params = params.set('search', request.search);

    return this.http.get<PagedResponse<Event>>(this.apiUrl, { params });
  }

  //  GET BY ID 
  getEventById(id: number | string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // CREATE EVENT (Organizer)
  createEvent(request: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, request);
  }

  //  UPDATE EVENT (Organizer)
  updateEvent(id: number | string, request: CreateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, request);
  }

  //  DELETE EVENT (Organizer Soft Delete)
  deleteEvent(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  //  PUBLISH EVENT 
  publishEvent(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/publish`, {});
  }

  //  CANCEL EVENT
  cancelEvent(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
  }


  // Organizer Scoped Events (/my-events)
  getOrganizerEvents(request?: PagedRequest): Observable<PagedResponse<Event>> {
    let params = new HttpParams();
    if (request?.page) params = params.set('page', request.page.toString());
    if (request?.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request?.search) params = params.set('search', request.search);

    return this.http.get<PagedResponse<Event>>(`${this.apiUrl}/my-events`, { params });
  }
}