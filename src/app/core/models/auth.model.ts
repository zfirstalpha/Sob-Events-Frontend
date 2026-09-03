export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Organizer' | 'Attendee';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'Organizer' | 'Attendee';
}