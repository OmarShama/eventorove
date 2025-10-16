import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('availability_rules')
@Index(['venueId', 'dayOfWeek'])
export class AvailabilityRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.availabilityRules)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column('int')
    dayOfWeek: number;

    @Column({ type: 'time' })
    startTime: string;

    @Column({ type: 'time' })
    endTime: string;

    @Column('boolean', { default: true })
    isAvailable: boolean;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}