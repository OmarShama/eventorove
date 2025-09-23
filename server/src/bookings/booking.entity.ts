import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Venue } from '../venues/venue.entity';
import { User } from '../users/user.entity';

export type BookingStatus = 'confirmed' | 'cancelled';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, v => v.bookings, { eager: true })
  venue: Venue;

  @ManyToOne(() => User, u => u.bookings, { eager: true })
  guest: User;

  @Column({ type: 'timestamptz' })
  startDateTime: Date;

  @Column({ type: 'timestamptz' })
  endDateTime: Date;

  @Column({ length: 20, default: 'confirmed' })
  status: BookingStatus;

  @Column('int')
  totalPriceEGP: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}