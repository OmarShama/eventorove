import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_images')
@Index(['venueId', 'displayOrder'])
export class VenueImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.images)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'varchar', length: 500 })
    imageUrl: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    altText: string;

    @Column('int', { default: 0 })
    displayOrder: number;

    @Column('boolean', { default: false })
    isMain: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}