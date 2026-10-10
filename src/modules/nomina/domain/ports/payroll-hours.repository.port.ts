import { WorkRateConfig } from 'src/entities/work-rate-config.model';
import { WorkdayConfig } from 'src/entities/workday-config.model';

export const PAYROLL_HOURS_REPOSITORY_PORT = Symbol(
  'PAYROLL_HOURS_REPOSITORY_PORT',
);

export interface PayrollHoursRepositoryPort {
  findWorkdayConfig(date: Date): Promise<WorkdayConfig | null>;
  findWorkRateConfig(type: string, date: Date): Promise<WorkRateConfig | null>;
  isHoliday(date: Date): Promise<boolean>;
}
