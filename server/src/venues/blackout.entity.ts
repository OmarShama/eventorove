import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('blackouts')
@Index(['venueId', 'dayOfWeek'])
export class Blackout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    venueId: string;

    @ManyToOne(() => Venue, v => v.blackouts)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'int' })
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    @Column({ type: 'time' })
    startTime: string; // HH:MM format

    @Column({ type: 'time' })
    endTime: string; // HH:MM format

    @Column({ type: 'varchar', length: 200, nullable: true })
    reason: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}