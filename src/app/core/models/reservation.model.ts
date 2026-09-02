import { LinkDto } from './link.model';

export type ReservationStatus = 'Reserved' | 'Paid' | 'Cancelled';

export interface Reservation {
  id: number;
  ticketTypeId: number;
  userId: number;
  quantity: number;
  reservedAt: string;
  expiryDate: string;
  status: ReservationStatus;
  links: LinkDto[];
}

export interface CreateReservationRequest {
  quantity: number;
}