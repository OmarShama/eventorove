import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Venue } from '../venues/venue.entity';
import { User } from '../users/user.entity';
import {
  CreateBookingRequest,
  BookingWithDetailsDto,
} from '../shared/types';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createBooking(createBookingDto: CreateBookingRequest): Promise<BookingWithDetailsDto> {
    // Validate venue exists and is approved
    const venue = await this.venueRepository.findOne({
      where: { id: createBookingDto.venueId },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    if (venue.status !== 'approved') {
      throw new Error('Venue is not available for booking');
    }

    // Calculate duration and validate
    const startDateTime = new Date(createBookingDto.startDateTime);
    const endDateTime = new Date(createBookingDto.endDateTime);
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    if (durationMinutes < (venue.minBookingMinutes || 30)) {
      throw new Error(`Minimum booking duration is ${venue.minBookingMinutes || 30} minutes`);
    }

    if (venue.maxBookingMinutes && durationMinutes > venue.maxBookingMinutes) {
      throw new Error(`Maximum booking duration is ${venue.maxBookingMinutes} minutes`);
    }

    // Validate capacity
    if (createBookingDto.guestCount > venue.capacity) {
      throw new Error(`Venue capacity is ${venue.capacity} people`);
    }

    // Calculate total price
    const hours = Math.ceil(durationMinutes / 30) * 0.5;
    const basePrice = parseFloat(venue.baseHourlyPriceEGP.toString());
    const totalPrice = hours * basePrice;

    // Get guest user (this should come from authentication context)
    const guest = await this.userRepository.findOne({ where: { id: 'current-user-id' } });
    if (!guest) {
      throw new Error('User not found');
    }

    // Create booking
    const booking = this.bookingRepository.create({
      venue,
      guest,
      startDateTime,
      endDateTime,
      guestCount: createBookingDto.guestCount,
      specialRequests: createBookingDto.specialRequests,
      totalPriceEGP: Math.round(totalPrice),
      status: 'confirmed',
    });

    const savedBooking = await this.bookingRepository.save(booking);
    return this.getBookingById(savedBooking.id);
  }

  async getBookingById(id: string): Promise<BookingWithDetailsDto | null> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['venue', 'guest'],
    });

    if (!booking) {
      return null;
    }

    return this.mapBookingToDto(booking);
  }

  async getBookingsByUser(userId: string): Promise<BookingWithDetailsDto[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.venue', 'venue')
      .leftJoinAndSelect('booking.guest', 'guest')
      .where('guest.id = :userId', { userId })
      .orderBy('booking.createdAt', 'DESC')
      .getMany();

    return bookings.map(booking => this.mapBookingToDto(booking));
  }

  async getBookingsByHost(hostId: string): Promise<BookingWithDetailsDto[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.venue', 'venue')
      .leftJoinAndSelect('venue.host', 'host')
      .leftJoinAndSelect('booking.guest', 'guest')
      .where('host.id = :hostId', { hostId })
      .orderBy('booking.createdAt', 'DESC')
      .getMany();

    return bookings.map(booking => this.mapBookingToDto(booking));
  }

  async getAllBookings(): Promise<BookingWithDetailsDto[]> {
    const bookings = await this.bookingRepository.find({
      relations: ['venue', 'guest'],
      order: { createdAt: 'DESC' },
    });

    return bookings.map(booking => this.mapBookingToDto(booking));
  }

  private mapBookingToDto(booking: any): BookingWithDetailsDto {
    return {
      id: booking.id,
      venueId: booking.venueId,
      guestId: booking.guestId,
      startDateTime: booking.startDateTime?.toISOString(),
      endDateTime: booking.endDateTime?.toISOString(),
      status: booking.status,
      totalPriceEGP: booking.totalPriceEGP,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      venue: booking.venue ? {
        id: booking.venue.id,
        hostId: booking.venue.hostId,
        title: booking.venue.title,
        description: booking.venue.description,
        category: booking.venue.category,
        address: booking.venue.address,
        city: booking.venue.city,
        lat: booking.venue.lat,
        lng: booking.venue.lng,
        capacity: booking.venue.capacity,
        baseHourlyPriceEGP: booking.venue.baseHourlyPriceEGP,
        minBookingMinutes: booking.venue.minBookingMinutes,
        maxBookingMinutes: booking.venue.maxBookingMinutes,
        bufferMinutes: booking.venue.bufferMinutes,
        status: booking.venue.status,
        createdAt: booking.venue.createdAt?.toISOString(),
        updatedAt: booking.venue.updatedAt?.toISOString(),
      } : null,
      guest: booking.guest ? {
        id: booking.guest.id,
        email: booking.guest.email,
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName,
        profileImageUrl: booking.guest.profileImageUrl,
        role: booking.guest.role,
        emailVerifiedAt: booking.guest.emailVerifiedAt?.toISOString(),
        createdAt: booking.guest.createdAt?.toISOString(),
        updatedAt: booking.guest.updatedAt?.toISOString(),
      } : null,
    };
  }
}
