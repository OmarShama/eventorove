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

/**
 * Auto-discover and run all SQL migration files in alphabetical order
 */
async function runAllMigrations(queryRunner: any, schema: string) {
    const fs = require('fs');
    const path = require('path');

    // Find the migrations directory
    const possibleMigrationDirs = [
        path.join(__dirname),
        path.join(__dirname, '../migrations'),
        path.join(process.cwd(), 'src/migrations'),
        path.join(process.cwd(), 'dist/migrations'),
        '/app/src/migrations',
        '/app/dist/migrations'
    ];

    let migrationsDir = null;
    for (const dir of possibleMigrationDirs) {
        try {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const sqlFiles = files.filter((file: string) => file.endsWith('.sql'));
                if (sqlFiles.length > 0) {
                    migrationsDir = dir;
                    console.log(`Found migrations directory at: ${dir}`);
                    break;
                }
            }
        } catch (err) {
            // Continue to next directory
        }
    }

    if (!migrationsDir) {
        throw new Error('Could not find migrations directory with SQL files. Tried: ' + possibleMigrationDirs.join(', '));
    }

    // Get all SQL files and sort them alphabetically
    const allFiles = fs.readdirSync(migrationsDir);
    const sqlFiles = allFiles
        .filter((file: string) => file.endsWith('.sql'))
        .sort(); // Alphabetical order ensures proper migration sequence

    console.log(`Found ${sqlFiles.length} migration files: ${sqlFiles.join(', ')}`);

    // Run each migration file
    for (const migrationFile of sqlFiles) {
        console.log(`Running migration: ${migrationFile}`);

        const sqlPath = path.join(migrationsDir, migrationFile);
        const sqlFile = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = sqlFile.split(';').filter((stmt: string) => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await queryRunner.query(statement);
            }
        }

        console.log(`Migration ${migrationFile} completed successfully`);
    }
}

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

            // Auto-discover and run all SQL migration files
            await runAllMigrations(queryRunner, schema);

            console.log('All database migrations completed successfully');

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
            console.log('Database tables already exist, checking for pending migrations...');

            // For existing databases, we'll run all migrations to ensure schema is up to date
            // This is safe because SQL migrations typically use CREATE TABLE IF NOT EXISTS
            // and other idempotent operations
            try {
                await runAllMigrations(queryRunner, schema);
                console.log('All pending migrations completed successfully');
            } catch (error) {
                console.warn('Some migrations may have failed or were already applied:', error.message);
                // Continue execution as some migrations might be idempotent
            }
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
