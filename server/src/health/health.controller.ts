import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2025-01-16T00:48:48.000Z' },
                uptime: { type: 'number', example: 123.456 },
                environment: { type: 'string', example: 'production' },
                database: { type: 'string', example: 'connected' }
            }
        }
    })
    async check() {
        let databaseStatus = 'disconnected';

        try {
            // Test database connection
            await this.dataSource.query('SELECT 1');
            databaseStatus = 'connected';
        } catch (error) {
            console.error('Database health check failed:', error.message);
            databaseStatus = 'error';
        }

        return {
            status: databaseStatus === 'connected' ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: databaseStatus
        };
    }
}
