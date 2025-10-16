import {
  Controller,
  Get,
  Post,
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
import {
  ApiResponse,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchRequest,
  VenueSearchResponse,
  VenueWithDetailsDto,
  AvailabilityCheckRequest,
  AvailabilityCheckResponse,
} from '../shared/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('api/venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) { }

  @Get('search')
  async searchVenues(@Query() query: VenueSearchRequest): Promise<ApiResponse<VenueSearchResponse>> {
    try {
      const result = await this.venuesService.searchVenues(query);
      return {
        success: true,
        data: result,
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
  async getVenue(@Param('id') id: string): Promise<ApiResponse<VenueWithDetailsDto>> {
    try {
      const venue = await this.venuesService.getVenueById(id);
      if (!venue) {
        throw new HttpException(
          {
            success: false,
            error: 'Venue not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: venue,
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

  @Post()
  @UseGuards(JwtAuthGuard)
  async createVenue(
    @Body() createVenueDto: CreateVenueRequest,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<VenueWithDetailsDto>> {
    try {
      console.log('Creating venue with user:', currentUser);

      // Check if user is host or admin
      if (currentUser.role !== 'host' && currentUser.role !== 'admin') {
        throw new Error('Only hosts and admins can create venues');
      }

      if (!currentUser.id) {
        throw new Error('User ID is missing from authentication');
      }

      const venue = await this.venuesService.createVenue(createVenueDto, currentUser.id);
      return {
        success: true,
        data: venue,
        message: 'Venue created successfully',
      };
    } catch (error) {
      console.error('Venue creation error:', error);
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  async updateVenue(
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueRequest,
  ): Promise<ApiResponse<VenueWithDetailsDto>> {
    try {
      const venue = await this.venuesService.updateVenue(id, updateVenueDto);
      return {
        success: true,
        data: venue,
        message: 'Venue updated successfully',
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

  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
    @Query() query: AvailabilityCheckRequest,
  ): Promise<ApiResponse<AvailabilityCheckResponse>> {
    try {
      const availability = await this.venuesService.checkAvailability(id, query);
      return {
        success: true,
        data: availability,
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

  @Post(':id/images')
  async addVenueImage(
    @Param('id') id: string,
    @Body() body: { imageURL: string },
  ): Promise<ApiResponse<any>> {
    try {
      const image = await this.venuesService.addVenueImage(id, body.imageURL);
      return {
        success: true,
        data: image,
        message: 'Image added successfully',
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

  @Post(':id/amenities')
  async addVenueAmenity(
    @Param('id') id: string,
    @Body() body: { name: string },
  ): Promise<ApiResponse<any>> {
    try {
      const amenity = await this.venuesService.addVenueAmenity(id, body.name);
      return {
        success: true,
        data: amenity,
        message: 'Amenity added successfully',
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

  @Post(':id/packages')
  async addVenuePackage(
    @Param('id') id: string,
    @Body() packageData: any,
  ): Promise<ApiResponse<any>> {
    try {
      const venuePackage = await this.venuesService.addVenuePackage(id, packageData);
      return {
        success: true,
        data: venuePackage,
        message: 'Package added successfully',
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

  @Post(':id/images/upload')
  async getUploadUrl(@Param('id') id: string): Promise<ApiResponse<any>> {
    try {
      const uploadUrl = await this.venuesService.getUploadUrl(id);
      return {
        success: true,
        data: uploadUrl,
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

  @Post(':id/availability-rules')
  @UseGuards(JwtAuthGuard)
  async addAvailabilityRule(
    @Param('id') id: string,
    @Body() ruleData: { dayOfWeek: number; openTime: string; closeTime: string },
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<any>> {
    try {
      const rule = await this.venuesService.addAvailabilityRule(id, ruleData);
      return {
        success: true,
        data: rule,
        message: 'Availability rule added successfully',
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

  @Post(':id/blackouts')
  @UseGuards(JwtAuthGuard)
  async addBlackout(
    @Param('id') id: string,
    @Body() blackoutData: { startDateTime: string; endDateTime: string; reason: string },
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<any>> {
    try {
      const blackout = await this.venuesService.addBlackout(id, blackoutData);
      return {
        success: true,
        data: blackout,
        message: 'Blackout period added successfully',
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
