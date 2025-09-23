import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Venue } from '../venues/venue.entity';

export type UserRole = 'guest' | 'host' | 'admin';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    name: string;

    @Column({ length: 180, unique: true })
    email: string;

    @Column({ select: false })
    passwordHash: string;

    @Column({ type: 'timestamptz', nullable: true })
    emailVerifiedAt: Date | null;

    @Column({ length: 10, default: 'guest' })
    role: UserRole;

    @OneToMany(() => Venue, v => v.host)
    venues: Venue[];

    @OneToMany(() => Booking, b => b.guest)
    bookings: Booking[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}