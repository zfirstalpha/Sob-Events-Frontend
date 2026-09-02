import { Component, inject, signal, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { EventCard} from '../../components/event-card/event-card';
import { EventService } from '../../../../core/services/event';
import { Event } from '../../../../core/models';


@Component({
  imports: [EventCard],
  standalone: true,
  selector: 'app-event-catalog',
  styleUrl: './event-catalog.scss',
  templateUrl: './event-catalog.html',
})
export class EventCatalogComponent implements OnInit{
  private eventService = inject(EventService);
  private router = inject(Router)
  
  events = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery= signal<string>('');
  selectedCategory = signal <string>('All');

  categories = ['All', 'Technology', 'Conference', 'Music $ Concerts', 'Business', 'Workshops'];

  ngOnInit(){
    this.loadEvents();
  }
  loadEvents(search?:string){
this.isLoading.set(true);
this.eventService.getEvents({search,pageSize:12}).subscribe({
  next:(res)=>{
    this.events.set(res.items);
    this.isLoading.set(false);

  },
  error:()=>{
    this.isLoading.set(false);
  }
});
  }

  onSearchChange(event: globalThis.Event){
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.loadEvents(value);

  }

  selectCategory(category:string){
    this.selectedCategory.set(category);
    if(category === 'All'){
      this.loadEvents();
    }else{
      this.loadEvents(category);
    }}

    onBookEvent(event:Event){
      this.router.navigate(['/events', event.id]);
    }
  }