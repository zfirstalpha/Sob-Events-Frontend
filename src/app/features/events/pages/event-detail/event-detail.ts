import { Component, inject, signal, computed, input, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../../core/services/event';
import { TicketService } from '../../../../core/services/ticket';
import { Event, TicketType } from '../../../../models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent implements OnInit {
  // Automatically receives :id from the URL (/events/:id)
  id = input.required<string>();

  private eventService = inject(EventService);
  private ticketService = inject(TicketService);

  // Zoneless Signals for page state
  event = signal<Event | null>(null);
  ticketTypes = signal<TicketType[]>([]);
  isLoading = signal<boolean>(true);

  // User booking selection state
  selectedTicketId = signal<number | null>(null);
  selectedQuantity = signal<number>(1);

  // Computed: currently selected ticket tier object
  selectedTicket = computed(() => 
    this.ticketTypes().find(t => t.id === this.selectedTicketId()) ?? null
  );

  //  Computed: live total price calculation
  totalPrice = computed(() => {
    const ticket = this.selectedTicket();
    return ticket ? ticket.price * this.selectedQuantity() : 0;
  });

  //  Computed: HATEOAS verification 
  canReserve = computed(() => {
    const ticket = this.selectedTicket();
    if (!ticket || ticket.availableQuantity < this.selectedQuantity() || !ticket.isActive) {
      return false;
    }
    // Verifies backend affordance exists
    return ticket.links?.some(l => l.rel === 'reserve') ?? true;
  });

  ngOnInit() {
    this.loadEventData();
  }

  loadEventData() {
    const eventId = this.id();
    this.isLoading.set(true);

    this.eventService.getEventById(eventId).subscribe({
      next: (evt) => {
        this.event.set(evt);
        this.loadTickets(eventId);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadTickets(eventId: string) {
    this.ticketService.getTicketTypesByEvent(eventId).subscribe({
      next: (tickets) => {
        this.ticketTypes.set(tickets);
        // Auto-select first available tier
        const firstAvailable = tickets.find(t => t.availableQuantity > 0 && t.isActive);
        if (firstAvailable) {
          this.selectedTicketId.set(firstAvailable.id);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectTicket(ticketId: number) {
    this.selectedTicketId.set(ticketId);
    this.selectedQuantity.set(1); // Reset quantity on tier switch
  }

  incrementQuantity() {
    const ticket = this.selectedTicket();
    if (ticket && this.selectedQuantity() < Math.min(10, ticket.availableQuantity)) {
      this.selectedQuantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.selectedQuantity() > 1) {
      this.selectedQuantity.update(q => q - 1);
    }
  }

  onReserve() {
    const ticket = this.selectedTicket();
    if (!ticket || !this.canReserve()) return;

    alert(`Proceeding to reserve ${this.selectedQuantity()}x ${ticket.name} ($${this.totalPrice()}) with a 15-minute hold.`);
  }
}