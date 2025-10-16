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
                    // Check if using pooled connection (port 6543) vs direct connection (port 5432)
                    const isPooledConnection = url.includes(':6543/');

                    console.log(`Connecting to database with ${isPooledConnection ? 'pooled' : 'direct'} connection`);
                    console.log(`Database URL: ${url.replace(/:[^:@]+@/, ':***@')}`); // Log URL without password

                    // Force IPv4 by modifying the URL to use IPv4 address if possible
                    let modifiedUrl = url;
                    if (url.includes('db.kvfmzqlozhpqdqcyeiqc.supabase.co')) {
                        // Try to force IPv4 resolution by using a different approach
                        console.log('Detected Supabase direct connection, applying IPv4 workaround');
                    }

                    // Try parsing URL for discrete connection parameters as fallback
                    try {
                        const urlObj = new URL(url);
                        const host = urlObj.hostname;
                        const port = parseInt(urlObj.port) || (isPooledConnection ? 6543 : 5432);
                        const username = urlObj.username;
                        const password = urlObj.password;
                        const database = urlObj.pathname.substring(1); // Remove leading slash

                        // Use discrete parameters with SSL bypass and IPv4 forcing
                        const sslConfig = {
                            rejectUnauthorized: false,
                            checkServerIdentity: () => undefined,
                        };

                        console.log(`Using discrete connection parameters: ${host}:${port}/${database}`);

                        return {
                            ...common,
                            host,
                            port,
                            username,
                            password,
                            database,
                            ssl: sslConfig,
                            extra: {
                                ssl: sslConfig,
                                // Force IPv4 and add connection options
                                family: 4, // Force IPv4
                                keepAlive: true,
                                keepAliveInitialDelayMillis: 10000,
                                // Additional connection pool settings for pooled connections
                                ...(isPooledConnection && {
                                    max: 10, // Limit connections for PgBouncer
                                    idleTimeoutMillis: 30000,
                                    connectionTimeoutMillis: 2000,
                                })
                            }
                        } as TypeOrmModuleOptions;
                    } catch (error) {
                        console.error('Failed to parse DATABASE_URL, falling back to URL method:', error);

                        // Fallback to URL method with IPv4 forcing and connection options
                        const withSSL = url.includes('sslmode=')
                            ? url.replace(/sslmode=[^&]+/, 'sslmode=require')
                            : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;

                        // Add IPv4 forcing parameters to URL
                        const urlWithIPv4 = withSSL + (withSSL.includes('?') ? '&' : '?') + 'preferIPv4=true';

                        return {
                            ...common,
                            url: urlWithIPv4,
                            ssl: {
                                rejectUnauthorized: false,
                                checkServerIdentity: () => undefined,
                            },
                            extra: {
                                ssl: {
                                    rejectUnauthorized: false,
                                    checkServerIdentity: () => undefined,
                                },
                                family: 4, // Force IPv4
                                keepAlive: true,
                                keepAliveInitialDelayMillis: 10000,
                                // Additional connection pool settings for pooled connections
                                ...(isPooledConnection && {
                                    max: 10, // Limit connections for PgBouncer
                                    idleTimeoutMillis: 30000,
                                    connectionTimeoutMillis: 2000,
                                })
                            }
                        } as TypeOrmModuleOptions;
                    }
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