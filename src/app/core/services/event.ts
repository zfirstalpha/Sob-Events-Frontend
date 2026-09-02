import { Injectable, inject } from '@angular/core';
import{HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, PagedRequest, PagedResponse } from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/events`;

    getEvents(request?: PagedRequest):Observable<PagedResponse<Event>>{
        let params = new HttpParams();
        if (request?.page) params = params.set('page', request.page.toString());

        if (request?.pageSize) params = params.set ('pageSize', request.pageSize.toString());
        

        if(request?.search) params = params.set('search', request.search);

        return this.http.get<PagedResponse<Event>>(this.apiUrl, {params});
    }
}
