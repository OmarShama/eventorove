import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Venue } from '../venues/venue.entity';
import { User } from '../users/user.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, Venue, User]),
        AuthModule,
    ],
    controllers: [BookingsController],
    providers: [BookingsService],
    exports: [TypeOrmModule, BookingsService],
})
export class BookingsModule { }