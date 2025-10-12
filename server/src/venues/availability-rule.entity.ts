import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('availability_rules')
@Index(['venueId', 'dayOfWeek'])
export class AvailabilityRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.availabilityRules)
    venue: Venue;

    @Column('int')
    dayOfWeek: number;

    @Column({ type: 'varchar', length: 5 })
    openTime: string;

    @Column({ type: 'varchar', length: 5 })
    closeTime: string;
}