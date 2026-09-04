import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { EventStore } from '../stores/event.store';

export interface LiveTicketUpdate {
  ticketTypeId: number;
  availableQuantity: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private eventStore = inject(EventStore);
  private hubConnection: HubConnection | null = null;

   
  isConnected = signal<boolean>(false);
  liveTicketUpdates = signal<LiveTicketUpdate | null>(null);

  startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/events')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.on('TicketsRemainingUpdated', (ticketTypeId: number, availableQuantity: number) => {
      console.log(`[SignalR] Live Seat Update: Ticket #${ticketTypeId} -> ${availableQuantity} remaining.`);
      // new object reference triggers effect every time
      this.liveTicketUpdates.set({ 
        ticketTypeId, 
        availableQuantity, 
        timestamp: Date.now() 
      });
    });

    this.hubConnection.on('EventStatusChanged', (eventId: number, newStatus: string) => {
      console.log(`[SignalR] Event #${eventId} status changed to ${newStatus}`);
      this.eventStore.loadEvents();
    });

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