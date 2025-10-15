import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    HttpException,
    HttpStatus,
    Session,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './current-user.decorator';
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
    role?: 'guest' | 'host' | 'admin';
}

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: CurrentUserData): Promise<ApiResponse<UserDto>> {
        try {
            const fullUser = await this.authService.getUserById(user.id);
            if (!fullUser) {
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
                data: fullUser,
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
            // Only allow guest, host, and admin roles for self-registration (admin for testing)
            if (registerDto.role && !['guest', 'host', 'admin'].includes(registerDto.role)) {
                throw new HttpException(
                    {
                        success: false,
                        error: 'Invalid role for self-registration',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

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

    @Patch('user')
    async updateProfile(
        @Body() updateData: Partial<{ firstName: string; lastName: string; profileImageUrl: string }>,
        @Session() session: any,
    ): Promise<ApiResponse<UserDto>> {
        try {
            if (!session.userId) {
                throw new HttpException(
                    {
                        success: false,
                        error: 'Not authenticated',
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const updatedUser = await this.authService.updateUser(session.userId, updateData);

            return {
                success: true,
                data: updatedUser,
                message: 'Profile updated successfully',
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

    @Patch('password')
    async changePassword(
        @Body() passwordData: { currentPassword: string; newPassword: string },
        @Session() session: any,
    ): Promise<ApiResponse<null>> {
        try {
            if (!session.userId) {
                throw new HttpException(
                    {
                        success: false,
                        error: 'Not authenticated',
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            }

            await this.authService.changePassword(
                session.userId,
                passwordData.currentPassword,
                passwordData.newPassword,
            );

            return {
                success: true,
                data: null,
                message: 'Password changed successfully',
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

    @Patch('upgrade-to-host')
    @UseGuards(JwtAuthGuard)
    async upgradeToHost(@CurrentUser() user: CurrentUserData): Promise<ApiResponse<UserDto>> {
        try {
            // Only allow guests to upgrade to host
            if (user.role !== 'guest') {
                throw new HttpException(
                    {
                        success: false,
                        error: 'Only guests can upgrade to host role',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const updatedUser = await this.authService.updateUserRole(user.id, 'host');

            return {
                success: true,
                data: updatedUser,
                message: 'Successfully upgraded to host role',
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
