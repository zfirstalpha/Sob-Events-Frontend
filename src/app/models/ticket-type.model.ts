import { LinkDto } from './link.model';

export interface TicketType {
  id: number;
  eventId: number;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  links: LinkDto[];
}

export interface CreateTicketTypeRequest {
  name: string;
  price: number;
  quantity: number;
  startDate: string;
  endDate: string;
}

export interface UpdateTicketTypeRequest {
  name: string;
  price: number;
  quantity: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}