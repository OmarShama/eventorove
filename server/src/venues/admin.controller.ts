import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { BookingsService } from '../bookings/bookings.service';
import { UsersService } from '../users/users.service';
import {
  ApiResponse,
  VenueWithDetailsDto,
  BookingWithDetailsDto,
  AdminStatsDto,
  UserDto,
} from '../shared/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly bookingsService: BookingsService,
    private readonly usersService: UsersService,
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

  // User Management Endpoints
  @Get('users')
  async getUsers(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse<UserDto[]>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const users = await this.usersService.getAllUsers({ role, search });
      return {
        success: true,
        data: users,
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

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() roleData: { role: 'guest' | 'host' | 'admin' },
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<UserDto>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Prevent admin from changing their own role
      if (id === currentUser.id) {
        throw new Error('Cannot change your own role');
      }

      const user = await this.usersService.updateUserRole(id, roleData.role);
      return {
        success: true,
        data: user,
        message: 'User role updated successfully',
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

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() statusData: { status: 'active' | 'suspended' | 'banned' },
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<UserDto>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Prevent admin from changing their own status
      if (id === currentUser.id) {
        throw new Error('Cannot change your own status');
      }

      const user = await this.usersService.updateUserStatus(id, statusData.status);
      return {
        success: true,
        data: user,
        message: 'User status updated successfully',
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

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<null>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Prevent admin from deleting their own account
      if (id === currentUser.id) {
        throw new Error('Cannot delete your own account');
      }

      await this.usersService.deleteUser(id);
      return {
        success: true,
        data: null,
        message: 'User deleted successfully',
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

  // Settings Management Endpoints
  @Get('settings')
  async getSettings(
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Mock settings data for now - would be replaced with actual settings service
      const settings = {
        siteName: 'Venue Booking Platform',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotificationsEnabled: true,
        maxBookingDays: 365,
        platformCommission: 0.05,
        minBookingAmount: 50,
        cancellationPeriod: 24,
      };

      return {
        success: true,
        data: settings,
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

  @Patch('settings')
  async updateSettings(
    @Body() settingsData: any,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Mock settings update for now - would be replaced with actual settings service
      const updatedSettings = { ...settingsData };

      return {
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully',
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

  // Analytics Endpoints
  @Get('analytics')
  async getAnalytics(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user is admin
      if (currentUser?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Mock analytics data for now - would be replaced with actual analytics service
      const analytics = {
        totalUsers: 1250,
        totalHosts: 45,
        totalVenues: 127,
        totalBookings: 3450,
        totalRevenue: 125000,
        revenueGrowth: 15.3,
        userGrowth: 8.7,
        bookingGrowth: 12.1,
        averageBookingValue: 275,
        monthlyRevenue: [
          { month: 'Jan', revenue: 8500 },
          { month: 'Feb', revenue: 9200 },
          { month: 'Mar', revenue: 11000 },
          { month: 'Apr', revenue: 12500 },
          { month: 'May', revenue: 13800 },
          { month: 'Jun', revenue: 15200 },
        ],
        topVenues: [
          { id: '1', name: 'Grand Ballroom', revenue: 25000, bookings: 45 },
          { id: '2', name: 'Garden Pavilion', revenue: 18500, bookings: 32 },
          { id: '3', name: 'Conference Center', revenue: 16200, bookings: 28 },
        ],
      };

      return {
        success: true,
        data: analytics,
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
