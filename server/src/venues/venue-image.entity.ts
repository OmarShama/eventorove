import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_images')
@Index(['venueId', 'order'])
export class VenueImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.images)
    venue: Venue;

    @Column({ type: 'varchar', length: 255 })
    url: string;

    @Column('int')
    order: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}