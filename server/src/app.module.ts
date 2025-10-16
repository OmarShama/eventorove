import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                `.env.${process.env.NODE_ENV || 'development'}`,
                '.env'
            ]
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService): TypeOrmModuleOptions => {
                const environment = config.get<string>('NODE_ENV') || 'development';
                const schema = config.get<string>('DB_SCHEMA') ?? 'public';
                const synchronize = (config.get<string>('DB_SYNC') ?? 'false') === 'true';
                const url = config.get<string>('DATABASE_URL');

                const common: Partial<TypeOrmModuleOptions> = {
                    type: 'postgres',
                    schema,
                    autoLoadEntities: true,
                    synchronize,
                    namingStrategy: new SnakeNamingStrategy(),
                };

                // For dev environment (Supabase), use DATABASE_URL
                if (url) {
                    const withSSL = url.includes('sslmode=')
                        ? url
                        : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;

                    // Check if using pooled connection (port 6543) vs direct connection (port 5432)
                    const isPooledConnection = url.includes(':6543/');

                    const sslConfig = isPooledConnection
                        ? {
                            rejectUnauthorized: false,
                            checkServerIdentity: () => undefined
                        }
                        : {
                            rejectUnauthorized: false
                        };

                    return {
                        ...common,
                        url: withSSL,
                        ssl: sslConfig,
                        extra: {
                            ssl: sslConfig,
                            // Additional connection pool settings for pooled connections
                            ...(isPooledConnection && {
                                max: 10, // Limit connections for PgBouncer
                                idleTimeoutMillis: 30000,
                                connectionTimeoutMillis: 2000,
                            })
                        }
                    } as TypeOrmModuleOptions;
                }

                // For local and docker environments, use discrete connection parameters
                return {
                    ...common,
                    host: config.get<string>('DB_HOST') ?? '127.0.0.1',
                    port: Number(config.get<string>('DB_PORT') ?? '5432'),
                    username: config.get<string>('DB_USER') ?? 'postgres',
                    password: config.get<string>('DB_PASS') ?? 'postgres',
                    database: String(config.get<string>('DB_NAME') ?? 'eventorove'), // force string
                } as TypeOrmModuleOptions;
            },
        }),
        UsersModule,
        VenuesModule,
        BookingsModule,
        AuthModule,
    ],
})
export class AppModule { }