import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { EventStore } from '../stores/event.store';


@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private eventStore = inject(EventStore);
  private hubConnection: HubConnection | null = null;

  // Signal indicating active connection
  isConnected = signal<boolean>(false);

  // Signal holding incoming live ticket capacity updates [ticketTypeId -> availableQuantity]
  liveTicketUpdates = signal<{ ticketTypeId: number; availableQuantity: number } | null>(null);

  startConnection() {
    // Connects through proxy.conf.json ("ws": true) to our backend /hubs/events
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/events')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Listen for live seat updates
    this.hubConnection.on('TicketsRemainingUpdated', (ticketTypeId: number, availableQuantity: number) => {
      console.log(`[SignalR] Live Seat Update: Ticket #${ticketTypeId} -> ${availableQuantity} remaining.`);
      this.liveTicketUpdates.set({ ticketTypeId, availableQuantity });
    });

    // 2. Listen for event status transitions (Draft -> Published)
    this.hubConnection.on('EventStatusChanged', (eventId: number, newStatus: string) => {
      console.log(`[SignalR] Event #${eventId} status changed to ${newStatus}`);
      this.eventStore.loadEvents(); // Reload catalog to show newly published event!
    });

    // Start WebSocket handshake
    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        console.log('[SignalR] Connected to EventsHub in real time!');
      })
      .catch((err) => {
        this.isConnected.set(false);
        console.error('[SignalR] Connection error:', err);
      });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }
}