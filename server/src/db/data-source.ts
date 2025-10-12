import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

const isDev = process.env.NODE_ENV !== 'production';
const allowSync = process.env.DB_SYNC === 'true';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'stagea',
    schema: process.env.DB_SCHEMA || 'stagea_local',   // ensure it exists
    entities: [path.resolve(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.resolve(__dirname, '..', 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'migrations',
    synchronize: isDev && allowSync,   // only if you set DB_SYNC=true locally
    migrationsRun: !allowSync,         // run migrations when not syncing
    namingStrategy: new SnakeNamingStrategy(),
    logging: isDev ? ['error', 'warn'] : ['error'],
});

export default AppDataSource;
