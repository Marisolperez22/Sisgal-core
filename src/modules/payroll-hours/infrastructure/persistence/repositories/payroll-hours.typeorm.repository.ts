import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttendanceRecord } from 'src/entities/attendance-record.model';
import { WorkRateConfig } from 'src/entities/work-rate-config.model';
import { WorkdayConfig } from 'src/entities/workday-config.model';

import { PayrollHoursRepositoryPort } from '../../../domain/ports/payroll-hours.repository.port';
import { Holiday } from 'src/entities';
import { getColombiaDate } from 'src/shared/common/utils/colombia-date.util';

@Injectable()
export class PayrollHoursTypeOrmRepository implements PayrollHoursRepositoryPort {
  constructor(
    @InjectRepository(WorkdayConfig)
    private readonly workdayConfigRepository: Repository<WorkdayConfig>,

    @InjectRepository(WorkRateConfig)
    private readonly workRateConfigRepository: Repository<WorkRateConfig>,

    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,

    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  findWorkdayConfig(date: Date): Promise<WorkdayConfig | null> {
    return this.workdayConfigRepository
      .createQueryBuilder('config')
      .where('config.valid_from <= :date', { date })
      .andWhere('(config.valid_to IS NULL OR config.valid_to >= :date)', {
        date,
      })
      .orderBy('config.valid_from', 'DESC')
      .getOne();
  }

  findWorkRateConfig(type: string, date: Date): Promise<WorkRateConfig | null> {
    return this.workRateConfigRepository
      .createQueryBuilder('rate')
      .where('rate.type = :type', { type })
      .andWhere('rate.valid_from <= :date', { date })
      .andWhere('(rate.valid_to IS NULL OR rate.valid_to >= :date)', {
        date,
      })
      .orderBy('rate.valid_from', 'DESC')
      .getOne();
  }

  async isHoliday(date: Date): Promise<boolean> {
    const colombiaDate = getColombiaDate(date);

    const holiday = await this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.date = CAST(:date AS date)', {
        date: colombiaDate,
      })
      .getOne();

    return Boolean(holiday);
  }
}
