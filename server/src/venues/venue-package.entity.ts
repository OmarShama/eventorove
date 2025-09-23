import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_packages')
export class VenuePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  venueId: string;

  @ManyToOne(() => Venue, v => v.packages)
  venue: Venue;

  @Column({ length: 120 })
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  hourlyPriceEGP: number;
}