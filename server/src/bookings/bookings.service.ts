import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from './booking.entity';
import { Venue } from '../venues/venue.entity';
import { User } from '../users/user.entity';
import {
  CreateBookingRequest,
  BookingWithDetailsDto,
} from '../shared/types';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async createBooking(createBookingDto: CreateBookingRequest, guestId: string): Promise<BookingWithDetailsDto> {
    return await this.dataSource.transaction(async (manager) => {
      // Validate venue exists and is approved
      const venue = await manager.findOne(Venue, {
        where: { id: createBookingDto.venueId },
        relations: ['availabilityRules', 'blackouts', 'bookings']
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

      // Check availability
      const dayOfWeek = startDateTime.getDay();
      const dayRule = venue.availabilityRules?.find(rule => rule.dayOfWeek === dayOfWeek);
      if (dayRule) {
        const [openHour, openMinute] = dayRule.startTime.split(':').map(Number);
        const [closeHour, closeMinute] = dayRule.endTime.split(':').map(Number);

        const openTime = new Date(startDateTime);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(startDateTime);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        if (startDateTime < openTime || endDateTime > closeTime) {
          throw new Error(`Venue is only available from ${dayRule.startTime} to ${dayRule.endTime} on ${this.getDayName(dayOfWeek)}`);
        }
      }

      // Check blackouts
      const conflictingBlackout = venue.blackouts?.find(blackout => {
        const requestDayOfWeek = startDateTime.getDay();
        const requestStartTime = startDateTime.toTimeString().slice(0, 5); // HH:MM format
        const requestEndTime = endDateTime.toTimeString().slice(0, 5); // HH:MM format

        // Check if the request is on the same day of week as the blackout
        if (requestDayOfWeek !== blackout.dayOfWeek) {
          return false;
        }

        // Check if the time ranges overlap
        return (requestStartTime < blackout.endTime && requestEndTime > blackout.startTime);
      });

      if (conflictingBlackout) {
        throw new Error(`Venue is unavailable during this time: ${conflictingBlackout.reason}`);
      }

      // Check existing bookings
      const conflictingBooking = venue.bookings?.find(booking => {
        if (booking.status === 'cancelled') return false;
        const bookingStart = new Date(booking.startDateTime);
        const bookingEnd = new Date(booking.endDateTime);
        return (startDateTime < bookingEnd && endDateTime > bookingStart);
      });

      if (conflictingBooking) {
        throw new Error('This time slot is already booked');
      }

      // Calculate total price
      const hours = Math.ceil(durationMinutes / 30) * 0.5;
      const basePrice = parseFloat(venue.baseHourlyPriceEGP.toString());
      const totalPrice = hours * basePrice;

      // Get guest user
      const guest = await manager.findOne(User, { where: { id: guestId } });
      if (!guest) {
        throw new Error('User not found');
      }

      // Create booking
      const booking = manager.create(Booking, {
        venue,
        guest,
        startDateTime,
        endDateTime,
        guestCount: createBookingDto.guestCount,
        specialRequests: createBookingDto.specialRequests,
        totalPriceEGP: Math.round(totalPrice),
        status: 'confirmed',
      });

      const savedBooking = await manager.save(Booking, booking);
      return this.getBookingById(savedBooking.id);
    });
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
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

  async cancelBooking(
    bookingId: string,
    userId: string,
    cancelBookingDto: CancelBookingDto,
  ): Promise<{ refundAmount: number; cancellationFee: number }> {
    // Find the booking and verify ownership
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, guest: { id: userId } },
      relations: ['venue', 'guest'],
    });

    if (!booking) {
      throw new Error('Booking not found or you do not have permission to cancel it');
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }

    // Calculate refund based on cancellation policy
    const now = new Date();
    const eventDate = new Date(booking.startDateTime);
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (hoursUntilEvent > 72) {
      refundPercentage = 0.9; // 90% refund
    } else if (hoursUntilEvent > 24) {
      refundPercentage = 0.5; // 50% refund
    } else if (hoursUntilEvent > 2) {
      refundPercentage = 0.25; // 25% refund
    } else {
      refundPercentage = 0; // No refund
    }

    const refundAmount = booking.totalPriceEGP * refundPercentage;
    const cancellationFee = booking.totalPriceEGP - refundAmount;

    // Update booking status
    booking.status = 'cancelled';
    booking.updatedAt = new Date();

    // In a real implementation, you would:
    // 1. Process the refund through payment gateway
    // 2. Send cancellation email to guest and venue
    // 3. Update any related records (availability, etc.)
    // 4. Log the cancellation reason and details

    await this.bookingRepository.save(booking);

    return {
      refundAmount,
      cancellationFee,
    };
  }

  private mapBookingToDto(booking: any): BookingWithDetailsDto {
    return {
      id: booking.id,
      venueId: booking.venue?.id,
      guestId: booking.guest?.id,
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
