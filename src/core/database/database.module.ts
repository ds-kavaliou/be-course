import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';

import { ConfigModule } from '@/core/config/config.module';
import { ConfigService } from '@/core/config/config.service';

/**
 * Registers the Drizzle database (node-postgres pool) for the whole application.
 * Inject it with `@InjectDrizzle()`; the pool is closed on application shutdown.
 */
@Module({
  imports: [
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        drizzle,
        connection: {
          host: config.get('POSTGRES_HOST'),
          port: Number(config.get('POSTGRES_PORT')),
          user: config.get('POSTGRES_USER'),
          password: config.get('POSTGRES_PASSWORD'),
          database: config.get('POSTGRES_DB'),
          // Fail fast instead of waiting forever when the database is unreachable
          connectionTimeoutMillis: 5000,
        },
        casing: 'snake_case' as const,
        logger: String(config.get('POSTGRES_LOGGING')) === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
