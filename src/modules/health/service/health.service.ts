import { env } from '@shared/config/env';
import { HealthDataDto } from '@modules/health/dto/health.dto';
import { healthRepository } from '@modules/health/repository/health.repository';

export const healthService = {
  getHealthStatus(): HealthDataDto {
    return {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: healthRepository.getDatabaseStatus(),
    };
  },
};
