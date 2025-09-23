import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { VenueImage } from './venue-image.entity';
import { VenueAmenity } from './venue-amenity.entity';
import { VenuePackage } from './venue-package.entity';
import { AvailabilityRule } from './availability-rule.entity';
import { Blackout } from './blackout.entity';
import { Booking } from '../bookings/booking.entity';

export type VenueStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

@Entity('venues')
@Index(['city', 'category'])
export class Venue {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, u => u.venues, { eager: true })
    host: User;

    @Column({ length: 160 })
    title: string;

    @Column('text')
    description: string;

    @Column({ length: 60 })
    category: string;

    @Column({ length: 200 })
    address: string;

    @Column({ length: 80 })
    city: string;

    @Column('float', { nullable: true })
    lat: number | null;

    @Column('float', { nullable: true })
    lng: number | null;

    @Column('int', { default: 0 })
    capacity: number;

    @Column('int', { default: 30 })
    minBookingMinutes: number;

    @Column('int', { nullable: true })
    maxBookingMinutes: number | null;

    @Column('int', { default: 30 })
    bufferMinutes: number;

    @Column('int', { default: 0 })
    baseHourlyPriceEGP: number;

    @Column({ length: 30, default: 'pending_approval' })
    status: VenueStatus;

    @OneToMany(() => VenueImage, i => i.venue, { cascade: true })
    images: VenueImage[];

    @OneToMany(() => VenueAmenity, a => a.venue, { cascade: true })
    amenities: VenueAmenity[];

    @OneToMany(() => VenuePackage, p => p.venue, { cascade: true })
    packages: VenuePackage[];

    @OneToMany(() => AvailabilityRule, r => r.venue, { cascade: true })
    availabilityRules: AvailabilityRule[];

    @OneToMany(() => Blackout, b => b.venue, { cascade: true })
    blackouts: Blackout[];

    @OneToMany(() => Booking, b => b.venue)
    bookings: Booking[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}