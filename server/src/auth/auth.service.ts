import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UserDto } from '../shared/types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
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
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(userData.password);

        const user = this.userRepository.create({
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'guest', // Default role
            emailVerifiedAt: new Date(), // Auto-verify for development
        });

        const savedUser = await this.userRepository.save(user);
        return this.mapUserToDto(savedUser);
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
