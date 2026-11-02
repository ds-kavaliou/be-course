import { getDrizzleToken } from '@nestjs/drizzle';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';

import { DatabaseHealthIndicator } from './database.health';

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;
  const db = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        HealthIndicatorService,
        { provide: getDrizzleToken(), useValue: db },
      ],
    }).compile();

    indicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
  });

  it('is up when the database answers', async () => {
    db.execute.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await expect(indicator.isHealthy('database')).resolves.toEqual({
      database: { status: 'up' },
    });
  });

  it('is down without leaking the driver error', async () => {
    db.execute.mockRejectedValue(new Error('password authentication failed'));

    await expect(indicator.isHealthy('database')).resolves.toEqual({
      database: { status: 'down', message: 'Database is unavailable' },
    });
  });

  it('is down when the query hangs longer than the timeout', async () => {
    db.execute.mockReturnValue(new Promise(() => undefined));

    await expect(indicator.isHealthy('database', 10)).resolves.toEqual({
      database: { status: 'down', message: 'Database is unavailable' },
    });
  });
});
