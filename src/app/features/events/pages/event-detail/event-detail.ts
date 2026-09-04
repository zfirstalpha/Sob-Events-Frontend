import { Component, inject, signal, computed, input, OnInit, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, exhaustMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService } from '../../../../core/services/event';
import { TicketService } from '../../../../core/services/ticket';
import { ReservationService } from '../../../../core/services/reservation';
import { ReservationStore } from '../../../../core/stores/reservation.store';
import { SignalrService } from '../../../../core/services/signalr'; // Injected SignalR!
import { Event, TicketType } from '../../../../core/models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent implements OnInit {
  id = input.required<string>();

  private eventService = inject(EventService);
  private ticketService = inject(TicketService);
  private reservationService = inject(ReservationService);
  private signalrService = inject(SignalrService);
  readonly reservationStore = inject(ReservationStore);

  private reserveClick$ = new Subject<{ ticketTypeId: number; quantity: number }>();

  event = signal<Event | null>(null);
  ticketTypes = signal<TicketType[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  selectedTicketId = signal<number | null>(null);
  selectedQuantity = signal<number>(1);

  selectedTicket = computed(() => 
    this.ticketTypes().find(t => t.id === this.selectedTicketId()) ?? null
  );

  totalPrice = computed(() => {
    const ticket = this.selectedTicket();
    return ticket ? ticket.price * this.selectedQuantity() : 0;
  });

  canReserve = computed(() => {
    const ticket = this.selectedTicket();
    if (!ticket || ticket.availableQuantity < this.selectedQuantity() || !ticket.isActive || this.isSubmitting()) {
      return false;
    }
    return ticket.links?.some(l => l.rel === 'reserve') ?? true;
  });

  constructor() {
    // MODULE 9 SESSION 3: effect() listens for incoming WebSocket seat updates in real time!
    effect(() => {
      const update = this.signalrService.liveTicketUpdates();
      if (update) {
        // Dynamically update the ticket tier's remaining capacity on screen!
        this.ticketTypes.update(tickets =>
          tickets.map(t => t.id === update.ticketTypeId 
            ? { ...t, availableQuantity: update.availableQuantity } 
            : t
          )
        );
      }
    });

    // Defensive booking stream with exhaustMap (Module 9 Slide 9)
    this.reserveClick$.pipe(
      exhaustMap(({ ticketTypeId, quantity }) => {
        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        return this.reservationService.createReservation(ticketTypeId, { quantity });
      }),
      takeUntilDestroyed()
    ).subscribe({
      next: (reservation) => {
        this.isSubmitting.set(false);
        this.reservationStore.setActiveHold(reservation);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail || 'Unable to reserve tickets. Please try again.');
      }
    });
  }

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
    this.selectedQuantity.set(1);
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

  onReserveClick() {
    const ticket = this.selectedTicket();
    if (!ticket || !this.canReserve()) return;

    this.reserveClick$.next({
      ticketTypeId: ticket.id,
      quantity: this.selectedQuantity()
    });
  }

  // Properly calls the backend to release the locked seats
  onReleaseHold() {
    this.reservationStore.releaseActiveHold();
  }
}