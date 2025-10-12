import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { BookingsService } from '../bookings/bookings.service';
import {
  ApiResponse,
  VenueWithDetailsDto,
  BookingWithDetailsDto,
  AdminStatsDto,
} from '../shared/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly bookingsService: BookingsService,
  ) { }

  @Get('venues')
  async getAdminVenues(
    @Query('status') status?: string,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<ApiResponse<VenueWithDetailsDto[]>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const venues = await this.venuesService.getVenuesForAdmin(status);
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

  @Patch('venues/:id/approve')
  async approveVenue(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<VenueWithDetailsDto>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const venue = await this.venuesService.updateVenueStatus(id, 'approved');
      return {
        success: true,
        data: venue,
        message: 'Venue approved successfully',
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

  @Patch('venues/:id/reject')
  async rejectVenue(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<VenueWithDetailsDto>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const venue = await this.venuesService.updateVenueStatus(id, 'rejected');
      return {
        success: true,
        data: venue,
        message: 'Venue rejected successfully',
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

  @Get('stats')
  async getAdminStats(@CurrentUser() currentUser: CurrentUserData): Promise<ApiResponse<AdminStatsDto>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const stats = await this.venuesService.getAdminStats();
      return {
        success: true,
        data: stats,
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
  async getAdminBookings(@CurrentUser() currentUser: CurrentUserData): Promise<ApiResponse<BookingWithDetailsDto[]>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const bookings = await this.bookingsService.getAllBookings();
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
