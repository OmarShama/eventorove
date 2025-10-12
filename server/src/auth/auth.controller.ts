import {
    Controller,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    Session,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
    ApiResponse,
    UserDto,
} from '../shared/types';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('user')
    async getCurrentUser(@Session() session: any, @Req() req: Request): Promise<ApiResponse<UserDto>> {
        try {
            // For development, return a mock user if no session exists
            if (!session.userId) {
                // Mock admin user for development
                const mockUser: UserDto = {
                    id: 'mock-admin-id',
                    email: 'admin@stagea.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin',
                    emailVerifiedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                return {
                    success: true,
                    data: mockUser,
                };
            }

            const user = await this.authService.getUserById(session.userId);
            if (!user) {
                throw new HttpException(
                    {
                        success: false,
                        error: 'User not found',
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    error: error.message,
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginRequest,
        @Session() session: any,
    ): Promise<ApiResponse<UserDto & { accessToken: string }>> {
        try {
            const result = await this.authService.login(loginDto.email, loginDto.password);

            if (!result) {
                throw new HttpException(
                    {
                        success: false,
                        error: 'Invalid credentials',
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }

            // Get user details for session and response
            const user = await this.authService.validateUser(loginDto.email, loginDto.password);

            // Store user ID in session
            session.userId = user.id;

            return {
                success: true,
                data: {
                    ...user,
                    accessToken: result.accessToken,
                },
                message: 'Login successful',
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    error: error.message,
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    @Post('register')
    async register(@Body() registerDto: RegisterRequest): Promise<ApiResponse<UserDto>> {
        try {
            const user = await this.authService.createUser(registerDto);

            return {
                success: true,
                data: user,
                message: 'Registration successful',
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

    @Post('logout')
    async logout(@Session() session: any): Promise<ApiResponse<null>> {
        try {
            session.destroy();

            return {
                success: true,
                data: null,
                message: 'Logout successful',
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
