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

  @Column({ length: 100 })
  name: string;
}