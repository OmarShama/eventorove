import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import * as session from 'express-session';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure CORS
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://your-frontend-domain.com']
            : ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    });

    // Configure sessions
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            },
        }),
    );

    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();