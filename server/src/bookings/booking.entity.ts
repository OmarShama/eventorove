import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Venue } from '../venues/venue.entity';
import { User } from '../users/user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

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

    @Column({ type: 'varchar', length: 20, default: 'confirmed' })
    status: BookingStatus;

    @Column('int')
    totalPriceEGP: number;

    @Column('int')
    guestCount: number;

    @Column('text', { nullable: true })
    specialRequests: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}