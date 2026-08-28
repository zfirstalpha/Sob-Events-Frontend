import { LinkDto } from './link.model';

export type EventStatus = 'Draft' | 'Published' | 'Cancelled';

export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  status: EventStatus;
  links: LinkDto[];
}

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
}