import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_amenities')
export class VenueAmenity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.amenities)
    venue: Venue;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}