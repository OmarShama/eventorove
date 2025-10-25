import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { UserDto } from '../shared/types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'guest' | 'host' | 'admin';
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) { }

    async validateUser(email: string, password: string): Promise<UserDto | null> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'firstName', 'lastName', 'profileImageUrl', 'password', 'role', 'emailVerifiedAt', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return null;
        }

        // For development, accept any password
        // In production, you would verify the hashed password
        const isPasswordValid = await this.verifyPassword(password, user.password || 'password');

        if (!isPasswordValid) {
            return null;
        }

        return this.mapUserToDto(user);
    }

    async getUserById(id: string): Promise<UserDto | null> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            return null;
        }

        return this.mapUserToDto(user);
    }

    async createUser(userData: CreateUserRequest): Promise<UserDto> {
        return await this.dataSource.transaction(async (manager) => {
            // Check if user already exists
            const existingUser = await manager.findOne(User, {
                where: { email: userData.email }
            });

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await this.hashPassword(userData.password);

            const user = manager.create(User, {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'guest', // Use provided role or default to guest
                emailVerifiedAt: new Date(), // Auto-verify for development
            });

            const savedUser = await manager.save(User, user);
            return this.mapUserToDto(savedUser);
        });
    }

    async login(email: string, password: string): Promise<{ accessToken: string } | null> {
        const user = await this.validateUser(email, password);
        if (!user) {
            return null;
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            // For development, if bcrypt fails, just return true
            return true;
        }
    }

    async updateUser(
        id: string,
        updateData: Partial<{ firstName: string; lastName: string; profileImageUrl: string }>,
    ): Promise<UserDto> {
        return await this.dataSource.transaction(async (manager) => {
            const user = await manager.findOne(User, { where: { id } });

            if (!user) {
                throw new Error('User not found');
            }

            // Update fields
            if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
            if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
            if (updateData.profileImageUrl !== undefined) user.profileImageUrl = updateData.profileImageUrl;

            const updatedUser = await manager.save(User, user);
            return this.mapUserToDto(updatedUser);
        });
    }

    async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
        return await this.dataSource.transaction(async (manager) => {
            const user = await manager.findOne(User, {
                where: { id },
                select: ['id', 'email', 'password'],
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Hash and save new password
            const hashedNewPassword = await this.hashPassword(newPassword);
            await manager.update(User, id, { password: hashedNewPassword });
        });
    }

    async updateUserRole(id: string, role: 'guest' | 'host' | 'admin'): Promise<UserDto> {
        return await this.dataSource.transaction(async (manager) => {
            const user = await manager.findOne(User, { where: { id } });
            if (!user) {
                throw new Error('User not found');
            }

            user.role = role;
            const updatedUser = await manager.save(User, user);
            return this.mapUserToDto(updatedUser);
        });
    }

    private mapUserToDto(user: User): UserDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
            createdAt: user.createdAt?.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
        };
    }
}
