import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Session,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import {
  ApiResponse,
  CreateBookingRequest,
  BookingWithDetailsDto,
} from '../shared/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body() createBookingDto: CreateBookingRequest,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<BookingWithDetailsDto>> {
    try {
      const booking = await this.bookingsService.createBooking(createBookingDto, currentUser.id);
      return {
        success: true,
        data: booking,
        message: 'Booking created successfully',
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

  @Get(':id')
  async getBooking(@Param('id') id: string): Promise<ApiResponse<BookingWithDetailsDto>> {
    try {
      const booking = await this.bookingsService.getBookingById(id);
      if (!booking) {
        throw new HttpException(
          {
            success: false,
            error: 'Booking not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: booking,
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@CurrentUser() currentUser: CurrentUserData): Promise<ApiResponse<BookingWithDetailsDto[]>> {
    try {
      const bookings = await this.bookingsService.getBookingsByUser(currentUser.id);
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

  @Get('host/:hostId')
  @UseGuards(JwtAuthGuard)
  async getHostBookings(
    @Param('hostId') hostId: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<BookingWithDetailsDto[]>> {
    try {
      // Check if user is the host or admin
      if (currentUser.id !== hostId && currentUser.role !== 'admin') {
        throw new Error('Unauthorized to view host bookings');
      }

      const bookings = await this.bookingsService.getBookingsByHost(hostId);
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

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllBookings(
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<BookingWithDetailsDto[]>> {
    try {
      // Check if user is admin
      if (currentUser.role !== 'admin') {
        throw new Error('Only admins can view all bookings');
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

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @Param('id') id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.bookingsService.cancelBooking(
        id,
        currentUser.id,
        cancelBookingDto,
      );

      return {
        success: true,
        data: result,
        message: 'Booking cancelled successfully',
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
