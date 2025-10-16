import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

// Helper function to resolve IPv4 address
async function resolveIPv4(hostname: string): Promise<string> {
    try {
        const result = await dnsLookup(hostname, { family: 4 });
        console.log(`Resolved ${hostname} to IPv4: ${result.address}`);
        return result.address;
    } catch (error) {
        console.warn(`Failed to resolve IPv4 for ${hostname}, using hostname:`, error.message);
        return hostname;
    }
}

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
            useFactory: async (config: ConfigService): Promise<TypeOrmModuleOptions> => {
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

                    // Force IPv4 by resolving hostname to IPv4 address
                    try {
                        const urlObj = new URL(url);
                        const hostname = urlObj.hostname;
                        const port = parseInt(urlObj.port) || (isPooledConnection ? 6543 : 5432);
                        const username = urlObj.username;
                        const password = urlObj.password;
                        const database = urlObj.pathname.substring(1); // Remove leading slash

                        // Resolve hostname to IPv4 address
                        const host = await resolveIPv4(hostname);

                        // Use discrete parameters with SSL bypass and IPv4 forcing
                        const sslConfig = {
                            rejectUnauthorized: false,
                            checkServerIdentity: () => undefined,
                        };

                        console.log(`Using discrete connection parameters: ${host}:${port}/${database}`);
                        console.log('Forcing IPv4 connection to avoid IPv6 issues');

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
                                // More aggressive IPv4 forcing
                                family: 4, // Force IPv4
                                keepAlive: true,
                                keepAliveInitialDelayMillis: 10000,
                                // Force IPv4 at the socket level
                                socket: {
                                    family: 4
                                },
                                // Additional connection pool settings for pooled connections
                                ...(isPooledConnection && {
                                    max: 10, // Limit connections for PgBouncer
                                    idleTimeoutMillis: 30000,
                                    connectionTimeoutMillis: 2000,
                                })
                            }
                        } as TypeOrmModuleOptions;
                    } catch (error) {
                        console.error('Failed to parse DATABASE_URL, trying alternative approach:', error);

                        // Alternative approach: Modify URL to force IPv4
                        let modifiedUrl = url;

                        // Replace the hostname with IPv4 if possible, or add IPv4 forcing parameters
                        if (url.includes('db.kvfmzqlozhpqdqcyeiqc.supabase.co')) {
                            // Try to force IPv4 resolution
                            modifiedUrl = url.replace('db.kvfmzqlozhpqdqcyeiqc.supabase.co', 'db.kvfmzqlozhpqdqcyeiqc.supabase.co');
                        }

                        // Ensure sslmode=require and add IPv4 forcing
                        const withSSL = modifiedUrl.includes('sslmode=')
                            ? modifiedUrl.replace(/sslmode=[^&]+/, 'sslmode=require')
                            : `${modifiedUrl}${modifiedUrl.includes('?') ? '&' : '?'}sslmode=require`;

                        // Add multiple IPv4 forcing parameters
                        const urlWithIPv4 = withSSL + (withSSL.includes('?') ? '&' : '?') + 'preferIPv4=true&ipv4=true';

                        console.log('Using URL method with IPv4 forcing');
                        console.log(`Modified URL: ${urlWithIPv4.replace(/:[^:@]+@/, ':***@')}`);

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
                                // Multiple IPv4 forcing approaches
                                family: 4, // Force IPv4
                                keepAlive: true,
                                keepAliveInitialDelayMillis: 10000,
                                // Force IPv4 at the socket level
                                socket: {
                                    family: 4
                                },
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