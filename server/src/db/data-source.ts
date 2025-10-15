import 'dotenv/config';
import { DataSource } from 'typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

// Load environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const isProd = environment === 'production';
const allowSync = process.env.DB_SYNC === 'true';
const schema = process.env.DB_SCHEMA || 'public';
const urlFromEnv = process.env.DATABASE_URL;

const logging: LoggerOptions = isProd ? ['error'] : ['error', 'warn'];

const entities = [
    path.resolve(__dirname, '**', '*.entity.{ts,js}'),
    path.resolve(__dirname, '..', '**', '*.entity.{ts,js}'),
];

const migrations = [
    path.resolve(__dirname, 'migrations', '*{.ts,.js}'),
    path.resolve(__dirname, '..', 'migrations', '*{.ts,.js}'),
];

function buildOptions(): PostgresConnectionOptions {
    const common: Partial<PostgresConnectionOptions> = {
        type: 'postgres',
        schema,
        entities,
        migrations,
        migrationsTableName: 'migrations',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: !isProd && allowSync,
        migrationsRun: isProd || !allowSync,
        logging,
    };

    if (urlFromEnv) {
        const withSSL = urlFromEnv.includes('sslmode=')
            ? urlFromEnv
            : `${urlFromEnv}${urlFromEnv.includes('?') ? '&' : '?'}sslmode=require`;

        return {
            ...common,
            url: withSSL,
            ssl: { rejectUnauthorized: false },
        } as PostgresConnectionOptions;
    }

    return {
        ...common,
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: String(process.env.DB_NAME || 'eventorove'), // force string
    } as PostgresConnectionOptions;
}

const AppDataSource = new DataSource(buildOptions());
export default AppDataSource;
