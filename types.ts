
export enum ReservationStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  SEATED = 'SEATED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED'
}

export enum BookingType {
  WALK_IN = 'WALK_IN',
  SCHEDULED = 'SCHEDULED'
}

export enum Section {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR'
}

export interface SectionConfig {
  twoSeaters: number;
  fourSeaters: number;
  sixSeaters: number;
  eightSeaters: number;
}

export interface TableConfig {
  indoor: SectionConfig;
  outdoor: SectionConfig;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  timestamp: Date;
  bookingType: BookingType;
  section: Section;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  status: ReservationStatus;
  readyAt?: Date;
  expiresAt?: Date;
}

export interface RestaurantStats {
  currentCapacity: number;
  maxCapacity: number;
  waitingCount: number;
  averageWaitTimeMinutes: number;
}
