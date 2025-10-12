import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST', '127.0.0.1'),
                port: parseInt(config.get('DB_PORT', '5432'), 10),
                username: config.get('DB_USER', 'postgres'),
                password: config.get('DB_PASS', 'postgres'),
                database: config.get('DB_NAME', 'stagea'),
                schema: config.get('DB_SCHEMA', 'stagea_local'),
                autoLoadEntities: true,
                synchronize: false,
                namingStrategy: new SnakeNamingStrategy(),
            }),
        }),
        UsersModule,
        VenuesModule,
        BookingsModule,
        AuthModule,
    ],
})
export class AppModule { }