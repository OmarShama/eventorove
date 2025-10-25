import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

// Centralized JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecret';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAuthGuard,
        RolesGuard,
        {
            provide: 'JWT_SECRET',
            useValue: JWT_SECRET,
        },
    ],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, 'JWT_SECRET'],
})
export class AuthModule { }
