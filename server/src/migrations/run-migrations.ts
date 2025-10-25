import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Venue } from '../venues/venue.entity';
import { Booking } from '../bookings/booking.entity';
import { VenueImage } from '../venues/venue-image.entity';
import { VenueAmenity } from '../venues/venue-amenity.entity';
import { VenuePackage } from '../venues/venue-package.entity';
import { AvailabilityRule } from '../venues/availability-rule.entity';
import { Blackout } from '../venues/blackout.entity';
import { Session } from '../sessions/session.entity';
import { SupabaseNamingStrategy } from '../shared/supabase-naming-strategy';

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
        namingStrategy: new SupabaseNamingStrategy(),
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

            // Read and execute the SQL migration file
            const fs = require('fs');
            const path = require('path');

            // Try multiple possible locations for the SQL file
            const possiblePaths = [
                path.join(__dirname, '001-create-tables.sql'),
                path.join(__dirname, '../migrations/001-create-tables.sql'),
                path.join(process.cwd(), 'src/migrations/001-create-tables.sql'),
                path.join(process.cwd(), 'dist/migrations/001-create-tables.sql'),
                '/app/src/migrations/001-create-tables.sql',
                '/app/dist/migrations/001-create-tables.sql'
            ];

            let sqlFile = null;
            for (const sqlPath of possiblePaths) {
                try {
                    sqlFile = fs.readFileSync(sqlPath, 'utf8');
                    console.log(`Found SQL file at: ${sqlPath}`);
                    break;
                } catch (err) {
                    // Continue to next path
                }
            }

            if (!sqlFile) {
                throw new Error('Could not find 001-create-tables.sql file. Tried paths: ' + possiblePaths.join(', '));
            }

            // Split by semicolon and execute each statement
            const statements = sqlFile.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await queryRunner.query(statement);
                }
            }

            console.log('Database tables created successfully from SQL migration');

            // Create admin user
            console.log('Creating admin user...');

            // Check if admin user already exists
            const adminExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM users 
                    WHERE email = 'admin@eventorove.com'
                )
            `);

            if (!adminExists[0].exists) {
                const hashedPassword = await bcrypt.hash('admin', 10);

                await queryRunner.query(`
                    INSERT INTO users (id, email, first_name, last_name, password, role, email_verified_at, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'admin@eventorove.com', 'Admin', 'User', $1, 'admin', NOW(), NOW(), NOW())
                `, [hashedPassword]);

                console.log('Admin user created successfully');
            } else {
                console.log('Admin user already exists, skipping creation');
            }
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
