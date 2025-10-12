import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
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
  async createBooking(@Body() createBookingDto: CreateBookingRequest): Promise<ApiResponse<BookingWithDetailsDto>> {
    try {
      const booking = await this.bookingsService.createBooking(createBookingDto);
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
}
