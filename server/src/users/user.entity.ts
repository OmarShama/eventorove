import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Venue } from '../venues/venue.entity';

export type UserRole = 'guest' | 'host' | 'admin';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 180, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', nullable: true })
    profileImageUrl: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'timestamptz', nullable: true })
    emailVerifiedAt: Date | null;

    @Column({ type: 'varchar', length: 10, default: 'guest' })
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