import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('blackouts')
@Index(['venueId', 'startDateTime'])
export class Blackout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  venueId: string;

  @ManyToOne(() => Venue, v => v.blackouts)
  venue: Venue;

  @Column({ type: 'timestamptz' })
  startDateTime: Date;

  @Column({ type: 'timestamptz' })
  endDateTime: Date;

  @Column({ length: 200 })
  reason: string;
}