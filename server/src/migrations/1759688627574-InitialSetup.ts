import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1759688627574 implements MigrationInterface {
    name = 'InitialSetup1759688627574';

    private getSchema(qr: QueryRunner) {
        const opt = qr.connection.options as any;
        return process.env.DB_SCHEMA || opt.schema || 'public';
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = this.getSchema(queryRunner);

        // Ensure schema & extensions
        await queryRunner.query(`create schema if not exists "${schema}"`);
        await queryRunner.query(`create extension if not exists "pgcrypto"`); // for gen_random_uuid() ensure timezone - aware defaults behave consistently
        await queryRunner.query(`set timezone to 'UTC'`);

        // USERS
        await queryRunner.query(`
      CREATE TABLE "${schema}"."users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(180) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "profile_image_url" character varying,
        "password" character varying NOT NULL,
        "email_verified_at" TIMESTAMP WITH TIME ZONE,
        "role" character varying(10) NOT NULL DEFAULT 'guest',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

        // VENUES
        await queryRunner.query(`
      CREATE TABLE "${schema}"."venues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(160) NOT NULL,
        "description" text NOT NULL,
        "category" character varying(60) NOT NULL,
        "address" character varying(200) NOT NULL,
        "city" character varying(80) NOT NULL,
        "lat" double precision,
        "lng" double precision,
        "capacity" integer NOT NULL DEFAULT '0',
        "min_booking_minutes" integer NOT NULL DEFAULT '30',
        "max_booking_minutes" integer,
        "buffer_minutes" integer NOT NULL DEFAULT '30',
        "base_hourly_price_egp" integer NOT NULL DEFAULT '0',
        "status" character varying(30) NOT NULL DEFAULT 'pending_approval',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "host_id" uuid,
        CONSTRAINT "PK_cb0f885278d12384eb7a81818be" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_21daccdf58a218c856ebf31472"
      ON "${schema}"."venues" ("city", "category")
    `);

        // SESSIONS
        await queryRunner.query(`
      CREATE TABLE "${schema}"."sessions" (
        "sid" character varying NOT NULL,
        "sess" jsonb NOT NULL,
        "expire" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_e2d6172ca19b8ebef797c362b05" PRIMARY KEY ("sid")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_session_expire"
      ON "${schema}"."sessions" ("expire")
    `);

        // VENUE_IMAGES
        await queryRunner.query(`
      CREATE TABLE "${schema}"."venue_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "venue_id" uuid NOT NULL,
        "url" character varying(255) NOT NULL,
        "order" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3cdef3bcc3a9d5c7a1a47dede36" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_46ba67718f1ed75d79018b26bd"
      ON "${schema}"."venue_images" ("venue_id", "order")
    `);

        // VENUE_AMENITIES
        await queryRunner.query(`
      CREATE TABLE "${schema}"."venue_amenities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "venue_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3a15fdf077849b236eea3e0e306" PRIMARY KEY ("id")
      )
    `);

        // VENUE_PACKAGES
        await queryRunner.query(`
      CREATE TABLE "${schema}"."venue_packages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "venue_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "description" text NOT NULL,
        "price_egp" integer NOT NULL,
        "duration_minutes" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_2b16cd8b28f789e1676f03cb865" PRIMARY KEY ("id")
      )
    `);

        // AVAILABILITY_RULES
        await queryRunner.query(`
      CREATE TABLE "${schema}"."availability_rules" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "venue_id" uuid NOT NULL,
        "day_of_week" integer NOT NULL,
        "open_time" character varying(5) NOT NULL,
        "close_time" character varying(5) NOT NULL,
        CONSTRAINT "PK_37dd3738c54ba3243cca374c2a1" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_dd0df1e806ecd64568136229dd"
      ON "${schema}"."availability_rules" ("venue_id", "day_of_week")
    `);

        // BLACKOUTS
        await queryRunner.query(`
      CREATE TABLE "${schema}"."blackouts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "venue_id" uuid NOT NULL,
        "start_date_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "reason" character varying(200) NOT NULL,
        CONSTRAINT "PK_635bfc9405a133e06c508542eb8" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_9c32dd7916f88e4f16a471ddca"
      ON "${schema}"."blackouts" ("venue_id", "start_date_time")
    `);

        // BOOKINGS
        await queryRunner.query(`
      CREATE TABLE "${schema}"."bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "start_date_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'confirmed',
        "total_price_egp" integer NOT NULL,
        "guest_count" integer NOT NULL,
        "special_requests" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "venue_id" uuid,
        "guest_id" uuid,
        CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
      )
    `);

        // --- Foreign Keys (match your originals) ---
        await queryRunner.query(`
      ALTER TABLE "${schema}"."bookings"
      ADD CONSTRAINT "FK_9285e4f67f013d21d8d9905b1e8"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."bookings"
      ADD CONSTRAINT "FK_b4403309538387262d97fdf2462"
      FOREIGN KEY ("guest_id") REFERENCES "${schema}"."users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."venue_images"
      ADD CONSTRAINT "FK_5637e9000a376395a07682cf624"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."venue_amenities"
      ADD CONSTRAINT "FK_52aa3f633512f7a025e288ba8eb"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."venue_packages"
      ADD CONSTRAINT "FK_5a3083b68ae7768b67dfe00ff09"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."availability_rules"
      ADD CONSTRAINT "FK_5f1145030cce493ceb73b54178a"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."blackouts"
      ADD CONSTRAINT "FK_5967706d8a7782a8b3201538c87"
      FOREIGN KEY ("venue_id") REFERENCES "${schema}"."venues"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "${schema}"."venues"
      ADD CONSTRAINT "FK_3cf08cd7d9735f9547cd8d14567"
      FOREIGN KEY ("host_id") REFERENCES "${schema}"."users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = this.getSchema(queryRunner);

        // Drop FKs first
        await queryRunner.query(`ALTER TABLE "${schema}"."venues" DROP CONSTRAINT "FK_3cf08cd7d9735f9547cd8d14567"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."blackouts" DROP CONSTRAINT "FK_5967706d8a7782a8b3201538c87"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."availability_rules" DROP CONSTRAINT "FK_5f1145030cce493ceb73b54178a"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."venue_packages" DROP CONSTRAINT "FK_5a3083b68ae7768b67dfe00ff09"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."venue_amenities" DROP CONSTRAINT "FK_52aa3f633512f7a025e288ba8eb"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."venue_images" DROP CONSTRAINT "FK_5637e9000a376395a07682cf624"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."bookings" DROP CONSTRAINT "FK_b4403309538387262d97fdf2462"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."bookings" DROP CONSTRAINT "FK_9285e4f67f013d21d8d9905b1e8"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_session_expire"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_21daccdf58a218c856ebf31472"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_9c32dd7916f88e4f16a471ddca"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_dd0df1e806ecd64568136229dd"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_46ba67718f1ed75d79018b26bd"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "${schema}"."sessions"`);
        await queryRunner.query(`DROP TABLE "${schema}"."venues"`);
        await queryRunner.query(`DROP TABLE "${schema}"."blackouts"`);
        await queryRunner.query(`DROP TABLE "${schema}"."availability_rules"`);
        await queryRunner.query(`DROP TABLE "${schema}"."venue_packages"`);
        await queryRunner.query(`DROP TABLE "${schema}"."venue_amenities"`);
        await queryRunner.query(`DROP TABLE "${schema}"."venue_images"`);
        await queryRunner.query(`DROP TABLE "${schema}"."users"`);
        await queryRunner.query(`DROP TABLE "${schema}"."bookings"`);
    }
}
