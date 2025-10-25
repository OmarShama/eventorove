import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import * as session from 'express-session';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false, // Disable default body parser to configure manually
    });

    // Configure CORS
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [
            'https://eventorove-production-524a.up.railway.app'  // Railway frontend
        ]
        : [
            'http://localhost:3000',  // Docker client
            'http://localhost:3001',  // Docker client
            'http://localhost:5000',  // Local server
            'http://localhost:5001',  // Local client
            'http://localhost:5173'   // Vite dev server
        ];

    // Add environment-specific origins if defined
    if (process.env.CORS_ORIGINS) {
        allowedOrigins.push(...process.env.CORS_ORIGINS.split(','));
    }

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });

    // Configure body parser with increased limits for image uploads
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
    const maxRequestSize = maxFileSize * 20; // Allow up to 20 images

    app.use(express.json({ limit: `${maxRequestSize}b` }));
    app.use(express.urlencoded({ limit: `${maxRequestSize}b`, extended: true }));
    app.use(express.raw({ limit: `${maxRequestSize}b` }));
    app.use(express.text({ limit: `${maxRequestSize}b` }));

    console.log(`Body parser configured with limit: ${maxRequestSize} bytes (${Math.round(maxRequestSize / 1024 / 1024)}MB)`);

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

    const port = process.env.PORT || 3001;
    const host = process.env.HOST || 'localhost';
    await app.listen(port, host);
    console.log(`Application is running on: http://${host}:${port}`);
}

bootstrap();