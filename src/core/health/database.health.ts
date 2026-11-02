import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

import type { Database } from '@/core/database/database.types';

const DEFAULT_TIMEOUT_MS = 1000;

/**
 * Readiness check: the database accepts connections and answers a trivial query.
 */
@Injectable()
export class DatabaseHealthIndicator {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);

  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy<const Key extends string>(
    key: Key,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.withTimeout(this.db.execute(sql`select 1`), timeoutMs);
      return indicator.up();
    } catch (error) {
      // Details go to the log only: /health is public and must not leak internals
      this.logger.warn(`Database health check failed: ${String(error)}`);
      return indicator.down({ message: 'Database is unavailable' });
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Timed out after ${timeoutMs} ms`)),
        timeoutMs,
      );
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
