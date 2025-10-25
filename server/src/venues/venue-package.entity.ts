import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_packages')
export class VenuePackage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.packages)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'varchar', length: 120 })
    name: string;

    @Column('text')
    description: string;

    @Column('int')
    priceEGP: number;

    @Column('int', { nullable: true })
    durationMinutes: number;

    @Column('int', { nullable: true })
    maxGuests: number;

    @Column('boolean', { default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}