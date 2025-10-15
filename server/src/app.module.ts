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
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService): TypeOrmModuleOptions => {
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

                if (url) {
                    const withSSL = url.includes('sslmode=')
                        ? url
                        : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;

                    return {
                        ...common,
                        url: withSSL,
                        ssl: { rejectUnauthorized: false },
                    } as TypeOrmModuleOptions;
                }

                // Fallback to discrete host/port envs for local/dev DB
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