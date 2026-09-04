import { LinkDto } from './link.model';

export type ReservationStatus = 'Reserved' | 'PendingApproval' | 'Confirmed' | 'Cancelled';

export interface Reservation {
  id: number;
  ticketTypeId: number;
  ticketTypeName: string;
  eventName: string;
  userId: number;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
  reservedAt: string;
  expiryDate: string;
  status: ReservationStatus;
  transactionReference?: string;
  rejectionReason?: string;
  links: LinkDto[];
}

export interface CreateReservationRequest {
  quantity: number;
}

export interface SubmitPaymentProofRequest {
  transactionReference: string;
}

export interface RejectReservationRequest {
  reason?: string;
}