import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    @Get()
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
