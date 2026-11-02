import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';

import { DatabaseHealthIndicator } from './database.health';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  const healthCheckService = { check: jest.fn() };
  const databaseHealthIndicator = { isHealthy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: DatabaseHealthIndicator, useValue: databaseHealthIndicator },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns an empty ok response', () => {
    expect(service.getEmptyResponse()).toEqual({ status: 'ok', details: {} });
  });

  it('runs the database check through HealthCheckService', async () => {
    const result = { status: 'ok', details: {} };
    healthCheckService.check.mockImplementation(
      async (indicators: Array<() => Promise<unknown>>) => {
        await Promise.all(indicators.map((indicator) => indicator()));
        return result;
      },
    );

    await expect(service.checkHealth()).resolves.toBe(result);
    expect(databaseHealthIndicator.isHealthy).toHaveBeenCalledWith('database');
  });
});
