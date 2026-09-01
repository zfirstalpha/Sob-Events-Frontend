import { Component, input, output } from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import { Event } from '../../../../models/event.model';
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-event-card',
  standalone: true,
  styleUrl: './event-card.scss',
  templateUrl: './event-card.html',
})
export class EventCard {
  event =input.required<Event>();
  bookClicked = output<Event>();

  onBookNow(e:MouseEvent){
    e.stopPropagation();
    this.bookClicked.emit(this.event());
  }
}
    