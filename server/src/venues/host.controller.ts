import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { BookingsService } from '../bookings/bookings.service';
import {
  ApiResponse,
  VenueWithDetailsDto,
  BookingWithDetailsDto,
} from '../shared/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/host')
@UseGuards(JwtAuthGuard)
export class HostController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly bookingsService: BookingsService,
  ) { }

  @Get('venues')
  async getHostVenues(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: string,
  ): Promise<ApiResponse<VenueWithDetailsDto[]>> {
    try {
      const venues = await this.venuesService.getVenuesByHost(currentUser.id, status);
      return {
        success: true,
        data: venues,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('bookings')
  async getHostBookings(@CurrentUser() currentUser: CurrentUserData): Promise<ApiResponse<BookingWithDetailsDto[]>> {
    try {
      const bookings = await this.bookingsService.getBookingsByHost(currentUser.id);
      return {
        success: true,
        data: bookings,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
