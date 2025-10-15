import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './venue.entity';
import { VenueImage } from './venue-image.entity';
import { VenueAmenity } from './venue-amenity.entity';
import { VenuePackage } from './venue-package.entity';
import { AvailabilityRule } from './availability-rule.entity';
import { Blackout } from './blackout.entity';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';
import { HostController } from './host.controller';
import { AdminController } from './admin.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { Booking } from '../bookings/booking.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Venue,
            VenueImage,
            VenueAmenity,
            VenuePackage,
            AvailabilityRule,
            Blackout,
            User,
            Booking,
        ]),
        BookingsModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [VenuesController, HostController, AdminController],
    providers: [VenuesService],
    exports: [TypeOrmModule, VenuesService],
})
export class VenuesModule { }