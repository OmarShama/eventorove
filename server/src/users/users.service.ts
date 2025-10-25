import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { User, UserRole } from './user.entity';
import { UserDto } from '../shared/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async getAllUsers(filters?: { role?: string; search?: string }): Promise<UserDto[]> {
    const whereConditions: any = {};

    if (filters?.role && filters.role !== 'all') {
      whereConditions.role = filters.role as UserRole;
    }

    let users: User[];

    if (filters?.search) {
      // Search by name or email
      users = await this.userRepository.find({
        where: [
          { firstName: Like(`%${filters.search}%`), ...whereConditions },
          { lastName: Like(`%${filters.search}%`), ...whereConditions },
          { email: Like(`%${filters.search}%`), ...whereConditions },
        ],
        order: { createdAt: 'DESC' },
      });
    } else {
      users = await this.userRepository.find({
        where: whereConditions,
        order: { createdAt: 'DESC' },
      });
    }

    return users.map(user => this.mapToUserDto(user));
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.mapToUserDto(user) : null;
  }

  async updateUserRole(id: string, role: UserRole): Promise<UserDto> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.role = role;
      const savedUser = await manager.save(User, user);

      return this.mapToUserDto(savedUser);
    });
  }

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'banned'): Promise<UserDto> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Note: The User entity doesn't have a status field, so this is a placeholder
      // In a real implementation, you would add a status field to the User entity
      // For now, we'll just return the user as-is

      return this.mapToUserDto(user);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        relations: ['venues', 'bookings'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has active venues or bookings
      if (user.venues && user.venues.length > 0) {
        throw new Error('Cannot delete user with active venues. Please transfer or remove venues first.');
      }

      if (user.bookings && user.bookings.length > 0) {
        throw new Error('Cannot delete user with booking history. Consider deactivating instead.');
      }

      await manager.remove(User, user);
    });
  }

  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() || '',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
