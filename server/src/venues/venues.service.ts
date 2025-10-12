import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Venue } from './venue.entity';
import { VenueImage } from './venue-image.entity';
import { VenueAmenity } from './venue-amenity.entity';
import { VenuePackage } from './venue-package.entity';
import { AvailabilityRule } from './availability-rule.entity';
import { Blackout } from './blackout.entity';
import { User } from '../users/user.entity';
import { Booking } from '../bookings/booking.entity';
import {
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchRequest,
  VenueSearchResponse,
  VenueWithDetailsDto,
  AvailabilityCheckRequest,
  AvailabilityCheckResponse,
  AdminStatsDto,
} from '../shared/types';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(VenueImage)
    private venueImageRepository: Repository<VenueImage>,
    @InjectRepository(VenueAmenity)
    private venueAmenityRepository: Repository<VenueAmenity>,
    @InjectRepository(VenuePackage)
    private venuePackageRepository: Repository<VenuePackage>,
    @InjectRepository(AvailabilityRule)
    private availabilityRuleRepository: Repository<AvailabilityRule>,
    @InjectRepository(Blackout)
    private blackoutRepository: Repository<Blackout>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) { }

  async searchVenues(filters: VenueSearchRequest): Promise<VenueSearchResponse> {
    const queryBuilder = this.venueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.host', 'host')
      .leftJoinAndSelect('venue.images', 'images')
      .leftJoinAndSelect('venue.amenities', 'amenities')
      .leftJoinAndSelect('venue.packages', 'packages')
      .leftJoinAndSelect('venue.availabilityRules', 'availabilityRules')
      .leftJoinAndSelect('venue.blackouts', 'blackouts')
      .where('venue.status = :status', { status: 'approved' });

    if (filters.q) {
      queryBuilder.andWhere(
        '(venue.title ILIKE :search OR venue.description ILIKE :search OR venue.address ILIKE :search)',
        { search: `%${filters.q}%` }
      );
    }

    if (filters.city) {
      queryBuilder.andWhere('venue.city ILIKE :city', { city: `%${filters.city}%` });
    }

    if (filters.category) {
      queryBuilder.andWhere('venue.category = :category', { category: filters.category });
    }

    if (filters.capacityMin) {
      queryBuilder.andWhere('venue.capacity >= :capacityMin', { capacityMin: filters.capacityMin });
    }

    if (filters.priceMin) {
      queryBuilder.andWhere('venue.baseHourlyPriceEGP >= :priceMin', { priceMin: filters.priceMin });
    }

    if (filters.priceMax) {
      queryBuilder.andWhere('venue.baseHourlyPriceEGP <= :priceMax', { priceMax: filters.priceMax });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    const [venues, total] = await queryBuilder.getManyAndCount();

    return {
      venues: venues.map(venue => this.mapVenueToDto(venue)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVenueById(id: string): Promise<VenueWithDetailsDto | null> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['host', 'images', 'amenities', 'packages', 'availabilityRules', 'blackouts'],
    });

    if (!venue) {
      return null;
    }

    return this.mapVenueToDto(venue);
  }

  async createVenue(createVenueDto: CreateVenueRequest, hostId: string): Promise<VenueWithDetailsDto> {
    // Get host user from authenticated user ID
    const host = await this.userRepository.findOne({ where: { id: hostId } });
    if (!host) {
      throw new Error('User not found');
    }

    const venue = this.venueRepository.create({
      ...createVenueDto,
      host,
      status: 'pending_approval', // Set to pending approval for review
    });

    const savedVenue = await this.venueRepository.save(venue);
    return this.getVenueById(savedVenue.id);
  }

  async updateVenue(id: string, updateVenueDto: UpdateVenueRequest): Promise<VenueWithDetailsDto> {
    await this.venueRepository.update(id, updateVenueDto);
    return this.getVenueById(id);
  }

  async checkAvailability(id: string, query: AvailabilityCheckRequest): Promise<AvailabilityCheckResponse> {
    // This is a simplified implementation
    // In a real application, you would check against bookings, availability rules, and blackouts
    const venue = await this.venueRepository.findOne({ where: { id } });

    if (!venue) {
      throw new Error('Venue not found');
    }

    // For now, return available = true
    // In a real implementation, you would check:
    // 1. Venue availability rules for the day/time
    // 2. Existing bookings that conflict
    // 3. Blackout periods
    return {
      available: true,
      conflicts: [],
      suggestedTimes: [],
    };
  }

  async addVenueImage(venueId: string, imageURL: string): Promise<any> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new Error('Venue not found');
    }

    const image = this.venueImageRepository.create({
      venueId,
      venue,
      url: imageURL,
      order: 0, // You might want to calculate the next index
    });

    return await this.venueImageRepository.save(image);
  }

  async addVenueAmenity(venueId: string, name: string): Promise<any> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new Error('Venue not found');
    }

    const amenity = this.venueAmenityRepository.create({
      venueId,
      venue,
      name,
    });

    return await this.venueAmenityRepository.save(amenity);
  }

  async addVenuePackage(venueId: string, packageData: any): Promise<any> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new Error('Venue not found');
    }

    const venuePackage = this.venuePackageRepository.create({
      venueId,
      venue,
      ...packageData,
    });

    return await this.venuePackageRepository.save(venuePackage);
  }

  async getUploadUrl(venueId: string): Promise<any> {
    // This would integrate with your file upload service
    // For now, return a placeholder
    return {
      uploadUrl: `https://api.example.com/upload/${venueId}`,
      fields: {},
    };
  }

  async getVenuesByHost(hostId: string, status?: string): Promise<VenueWithDetailsDto[]> {
    const queryBuilder = this.venueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.host', 'host')
      .leftJoinAndSelect('venue.images', 'images')
      .leftJoinAndSelect('venue.amenities', 'amenities')
      .leftJoinAndSelect('venue.packages', 'packages')
      .leftJoinAndSelect('venue.availabilityRules', 'availabilityRules')
      .leftJoinAndSelect('venue.blackouts', 'blackouts')
      .where('host.id = :hostId', { hostId });

    if (status) {
      queryBuilder.andWhere('venue.status = :status', { status });
    }

    queryBuilder.orderBy('venue.createdAt', 'DESC');

    const venues = await queryBuilder.getMany();
    return venues.map(venue => this.mapVenueToDto(venue));
  }

  async getVenuesForAdmin(status?: string): Promise<VenueWithDetailsDto[]> {
    const queryBuilder = this.venueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.host', 'host')
      .leftJoinAndSelect('venue.images', 'images')
      .leftJoinAndSelect('venue.amenities', 'amenities')
      .leftJoinAndSelect('venue.packages', 'packages')
      .leftJoinAndSelect('venue.availabilityRules', 'availabilityRules')
      .leftJoinAndSelect('venue.blackouts', 'blackouts');

    if (status) {
      queryBuilder.where('venue.status = :status', { status });
    }

    queryBuilder.orderBy('venue.createdAt', 'DESC');

    const venues = await queryBuilder.getMany();
    return venues.map(venue => this.mapVenueToDto(venue));
  }

  async updateVenueStatus(id: string, status: 'approved' | 'rejected'): Promise<VenueWithDetailsDto> {
    await this.venueRepository.update(id, { status });
    return this.getVenueById(id);
  }

  async getAdminStats(): Promise<AdminStatsDto> {
    // Calculate real statistics
    const totalVenues = await this.venueRepository.count();
    const pendingVenues = await this.venueRepository.count({ where: { status: 'pending_approval' } });
    const totalUsers = await this.userRepository.count();
    const totalBookings = await this.bookingRepository.count();

    // Calculate this month's bookings and revenue
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const bookingsThisMonth = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.createdAt >= :startDate', { startDate: firstDayOfMonth })
      .getCount();

    // Calculate revenue this month
    const bookingsWithRevenue = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.createdAt >= :startDate', { startDate: firstDayOfMonth })
      .getMany();

    const revenueThisMonth = bookingsWithRevenue
      .reduce((total, booking) => total + (booking.totalPriceEGP || 0), 0);

    return {
      totalVenues,
      totalBookings,
      totalUsers,
      pendingVenues,
      revenueThisMonth: revenueThisMonth.toString(),
      bookingsThisMonth,
    };
  }

  private mapVenueToDto(venue: any): VenueWithDetailsDto {
    return {
      id: venue.id,
      hostId: venue.hostId,
      title: venue.title,
      description: venue.description,
      category: venue.category,
      address: venue.address,
      city: venue.city,
      lat: venue.lat,
      lng: venue.lng,
      capacity: venue.capacity,
      baseHourlyPriceEGP: venue.baseHourlyPriceEGP,
      minBookingMinutes: venue.minBookingMinutes,
      maxBookingMinutes: venue.maxBookingMinutes,
      bufferMinutes: venue.bufferMinutes,
      status: venue.status,
      createdAt: venue.createdAt?.toISOString(),
      updatedAt: venue.updatedAt?.toISOString(),
      host: venue.host ? {
        id: venue.host.id,
        email: venue.host.email,
        firstName: venue.host.firstName,
        lastName: venue.host.lastName,
        profileImageUrl: venue.host.profileImageUrl,
        role: venue.host.role,
        emailVerifiedAt: venue.host.emailVerifiedAt?.toISOString(),
        createdAt: venue.host.createdAt?.toISOString(),
        updatedAt: venue.host.updatedAt?.toISOString(),
      } : null,
      images: venue.images?.map(img => ({
        id: img.id,
        venueId: img.venueId,
        path: img.url,
        idx: img.order,
        createdAt: img.createdAt?.toISOString(),
      })) || [],
      amenities: venue.amenities?.map(amenity => ({
        id: amenity.id,
        venueId: amenity.venueId,
        name: amenity.name,
        createdAt: amenity.createdAt?.toISOString(),
      })) || [],
      packages: venue.packages?.map(pkg => ({
        id: pkg.id,
        venueId: pkg.venueId,
        name: pkg.name,
        description: pkg.description,
        priceEGP: pkg.priceEGP,
        durationMinutes: pkg.durationMinutes,
        createdAt: pkg.createdAt?.toISOString(),
      })) || [],
      availabilityRules: venue.availabilityRules?.map(rule => ({
        id: rule.id,
        venueId: rule.venueId,
        dayOfWeek: rule.dayOfWeek,
        openTime: rule.openTime,
        closeTime: rule.closeTime,
        createdAt: rule.createdAt?.toISOString(),
      })) || [],
      blackouts: venue.blackouts?.map(blackout => ({
        id: blackout.id,
        venueId: blackout.venueId,
        startDateTime: blackout.startDateTime?.toISOString(),
        endDateTime: blackout.endDateTime?.toISOString(),
        reason: blackout.reason,
        createdAt: blackout.createdAt?.toISOString(),
      })) || [],
    };
  }
}
