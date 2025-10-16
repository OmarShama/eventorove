import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/user.entity';
import { Venue } from '../venues/venue.entity';
import { Booking } from '../bookings/booking.entity';
import { VenueImage } from '../venues/venue-image.entity';
import { VenueAmenity } from '../venues/venue-amenity.entity';
import { VenuePackage } from '../venues/venue-package.entity';
import { AvailabilityRule } from '../venues/availability-rule.entity';
import { Blackout } from '../venues/blackout.entity';
import { Session } from '../sessions/session.entity';

// Load environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function runMigrations() {
    const dataSource = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Venue, Booking, VenueImage, VenueAmenity, VenuePackage, AvailabilityRule, Blackout, Session],
        synchronize: false, // Never use synchronize in production
        logging: true,
        schema: process.env.DB_SCHEMA || 'public',
    });

    try {
        await dataSource.initialize();
        console.log('Database connection established successfully');

        // Check if tables exist, if not create them
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();

        // Check if users table exists in the correct schema
        const schema = process.env.DB_SCHEMA || 'eventorove_dev';
        const usersTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = $1 AND table_name = 'users'
            )
        `, [schema]);

        if (!usersTableExists[0].exists) {
            console.log('Creating database tables...');
            await dataSource.synchronize();
            console.log('Database tables created successfully');
        } else {
            console.log('Database tables already exist, skipping creation');
        }

        await queryRunner.release();
        await dataSource.destroy();
        console.log('Migration check completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
