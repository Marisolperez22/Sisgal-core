import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { WorkRateConfig } from 'src/entities/work-rate-config.model';
import type { WorkdayConfig } from 'src/entities/workday-config.model';
import {
  PAYROLL_HOURS_REPOSITORY_PORT,
  type PayrollHoursRepositoryPort,
} from '../../domain/ports/payroll-hours.repository.port';
import {
  getColombiaDate,
  getColombiaMinutes,
} from 'src/shared/common/utils/colombia-date.util';

export type TimePeriod = 'DIURNA' | 'NOCTURNA';
export type DayType = 'ORDINARY' | 'SUNDAY' | 'HOLIDAY';
export type WorkHourType =
  | 'ORDINARIA_DIURNA'
  | 'ORDINARIA_NOCTURNA'
  | 'EXTRA_DIURNA'
  | 'EXTRA_NOCTURNA'
  | 'DOMINICAL_DIURNA'
  | 'DOMINICAL_NOCTURNA'
  | 'EXTRA_DOMINICAL_DIURNA'
  | 'EXTRA_DOMINICAL_NOCTURNA';

export interface ClassifiedHour {
  start: Date;
  end: Date;
  hours: number;
  period: TimePeriod;
  dayType: DayType;
  isExtra: boolean;
  type: WorkHourType;
  multiplier: number;
  adjustedHours: number;
}

interface TimeSegment {
  start: Date;
  end: Date;
  hours: number;
  period: TimePeriod;
}

@Injectable()
export class PayrollHoursService {
  constructor(
    @Inject(PAYROLL_HOURS_REPOSITORY_PORT)
    private readonly payrollHoursRepository: PayrollHoursRepositoryPort,
  ) {}

  async classifyWorkedInterval(
    employeeId: number,
    start: Date,
    end: Date,
  ): Promise<ClassifiedHour[]> {
    this.validateEmployeeId(employeeId);
    this.validateInterval(start, end);

    const config = await this.getWorkdayConfig(start);
    const timeSegments = this.classifyTimePeriod(start, end, config);
    const dailySegments = this.determineDailyExtraHours(
      timeSegments,
      config.max_day_hours,
    );
    const classifiedSegments = await Promise.all(
      dailySegments.map((segment) => this.classifySegment(employeeId, segment)),
    );

    return classifiedSegments;
  }

  private async classifySegment(
    employeeId: number,
    segment: TimeSegment & { isExtra: boolean },
  ): Promise<ClassifiedHour> {
    const dayType = await this.determineDayType(employeeId, segment.start);
    const type = this.buildWorkHourType(
      segment.period,
      dayType,
      segment.isExtra,
    );
    const rate = await this.getWorkRate(type, segment.start);

    return {
      ...segment,
      dayType,
      type,
      multiplier: Number(rate.multiplier),
      adjustedHours: this.calculateAdjustedHours(
        segment.hours,
        Number(rate.multiplier),
      ),
    };
  }

  private async getWorkdayConfig(date: Date): Promise<WorkdayConfig> {
    const config = await this.payrollHoursRepository.findWorkdayConfig(date);

    if (!config) {
      throw new NotFoundException(
        `No existe configuración de jornada vigente para ${date.toISOString()}`,
      );
    }

    this.validateWorkdayConfig(config);
    return config;
  }

  private async getWorkRate(
    type: WorkHourType,
    date: Date,
  ): Promise<WorkRateConfig> {
    const rate = await this.payrollHoursRepository.findWorkRateConfig(
      type,
      date,
    );

    if (!rate) {
      throw new NotFoundException(
        `No existe multiplicador para ${type} vigente para ${date.toISOString()}`,
      );
    }

    return rate;
  }

  private classifyTimePeriod(
    start: Date,
    end: Date,
    config: WorkdayConfig,
  ): TimeSegment[] {
    const boundaries = this.getBoundaries(start, end, config);
    const segments: TimeSegment[] = [];

    for (let index = 0; index < boundaries.length - 1; index += 1) {
      const segmentStart = boundaries[index];
      const segmentEnd = boundaries[index + 1];
      const period = this.determinePeriod(segmentStart, config);

      if (period) {
        segments.push({
          start: segmentStart,
          end: segmentEnd,
          hours: this.calculateHours(segmentStart, segmentEnd),
          period,
        });
      }
    }

    return segments;
  }

  private getBoundaries(start: Date, end: Date, config: WorkdayConfig): Date[] {
    const boundaries = new Set<number>([start.getTime(), end.getTime()]);

    let currentDate = this.getColombiaDate(start);
    const lastDate = this.getColombiaDate(end);

    while (currentDate <= lastDate) {
      // Límites de la jornada para este día colombiano.
      for (const time of [
        config.day_start,
        config.day_end,
        config.night_start,
        config.night_end,
      ]) {
        const boundary = this.createColombiaDateTime(currentDate, time);

        if (boundary > start && boundary < end) {
          boundaries.add(boundary.getTime());
        }
      }

      // Medianoche colombiana del día siguiente.
      const nextDate = this.addColombiaDays(currentDate, 1);
      const midnight = this.createColombiaDateTime(nextDate, '00:00');

      if (midnight > start && midnight < end) {
        boundaries.add(midnight.getTime());
      }

      currentDate = nextDate;
    }

    return [...boundaries]
      .sort((a, b) => a - b)
      .map((timestamp) => new Date(timestamp));
  }

  private addColombiaDays(date: string, days: number): string {
    const calendarDate = new Date(`${date}T12:00:00Z`);
    calendarDate.setUTCDate(calendarDate.getUTCDate() + days);
    return calendarDate.toISOString().slice(0, 10);
  }

  private createColombiaDateTime(date: string, time: string): Date {
    const minutes = this.parseTime(time);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const timeString =
      `${String(hours).padStart(2, '0')}:` +
      `${String(remainingMinutes).padStart(2, '0')}:00`;

    // Colombia utiliza UTC-5 y no aplica horario de verano.
    return new Date(`${date}T${timeString}-05:00`);
  }

  private determinePeriod(
    date: Date,
    config: WorkdayConfig,
  ): TimePeriod | null {
    const time = this.getMinutesFromMidnight(date);
    const dayStart = this.parseTime(config.day_start);
    const dayEnd = this.parseTime(config.day_end);
    const nightStart = this.parseTime(config.night_start);
    const nightEnd = this.parseTime(config.night_end);

    if (time >= dayStart && time < dayEnd) {
      return 'DIURNA';
    }

    if (nightStart > nightEnd) {
      if (time >= nightStart || time < nightEnd) {
        return 'NOCTURNA';
      }
    } else if (time >= nightStart && time < nightEnd) {
      return 'NOCTURNA';
    }

    return null;
  }

  private async determineDayType(
    employeeId: number,
    date: Date,
  ): Promise<DayType> {
    const isHoliday = await this.payrollHoursRepository.isHoliday(date);

    if (isHoliday) {
      return 'HOLIDAY';
    }

    const colombiaDate = this.getColombiaDate(date);
    const calendarDate = new Date(`${colombiaDate}T12:00:00Z`);

    return calendarDate.getUTCDay() === 0 ? 'SUNDAY' : 'ORDINARY';
  }

  private determineDailyExtraHours(
    segments: TimeSegment[],
    maxDayHours: number,
  ): Array<TimeSegment & { isExtra: boolean }> {
    const dailySegments = new Map<string, TimeSegment[]>();

    for (const segment of segments) {
      let cursor = segment.start;

      while (cursor < segment.end) {
        const colombiaDate = this.getColombiaDate(cursor);
        const nextMidnight = this.createColombiaDateTime(
          this.addColombiaDays(colombiaDate, 1),
          '00:00',
        );

        const chunkEnd = new Date(
          Math.min(segment.end.getTime(), nextMidnight.getTime()),
        );

        const hours = this.calculateHours(cursor, chunkEnd);

        const chunk: TimeSegment = {
          start: new Date(cursor),
          end: chunkEnd,
          hours,
          period: segment.period,
        };

        const daySegments = dailySegments.get(colombiaDate) ?? [];
        daySegments.push(chunk);
        dailySegments.set(colombiaDate, daySegments);

        cursor = chunkEnd;
      }
    }

    const result: Array<TimeSegment & { isExtra: boolean }> = [];

    for (const daySegments of dailySegments.values()) {
      daySegments.sort((a, b) => a.start.getTime() - b.start.getTime());

      let usedHours = 0;

      for (const segment of daySegments) {
        const remainingCapacity = Math.max(0, maxDayHours - usedHours);
        const ordinaryHours = Math.min(segment.hours, remainingCapacity);
        const extraHours = Math.max(0, segment.hours - remainingCapacity);

        const splitAt = segment.start.getTime() + ordinaryHours * 3_600_000;

        if (ordinaryHours > 0) {
          result.push({
            ...segment,
            end: new Date(splitAt),
            hours: ordinaryHours,
            isExtra: false,
          });
        }

        if (extraHours > 0) {
          result.push({
            ...segment,
            start: new Date(splitAt),
            hours: extraHours,
            isExtra: true,
          });
        }

        usedHours += segment.hours;
      }
    }

    return result.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private getColombiaDate(date: Date): string {
    return getColombiaDate(date);
  }

  private buildWorkHourType(
    period: TimePeriod,
    dayType: DayType,
    isExtra: boolean,
  ): WorkHourType {
    const periodSuffix = period === 'DIURNA' ? 'DIURNA' : 'NOCTURNA';
    const dayPrefix =
      dayType === 'SUNDAY' || dayType === 'HOLIDAY' ? 'DOMINICAL' : 'ORDINARIA';

    if (isExtra) {
      return `${dayType === 'ORDINARY' ? 'EXTRA' : 'EXTRA_DOMINICAL'}_${periodSuffix}` as WorkHourType;
    }

    return `${dayPrefix}_${periodSuffix}` as WorkHourType;
  }

  private calculateAdjustedHours(hours: number, multiplier: number): number {
    return Number((hours * multiplier).toFixed(2));
  }

  private calculateHours(start: Date, end: Date): number {
    return Number(((end.getTime() - start.getTime()) / 3_600_000).toFixed(2));
  }

  private parseTime(value: string): number {
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);

    if (!match) {
      throw new BadRequestException(`Horario inválido: ${value}`);
    }

    return Number(match[1]) * 60 + Number(match[2]);
  }

  private getMinutesFromMidnight(date: Date): number {
    return getColombiaMinutes(date);
  }

  private startOfUtcDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private createDateWithTime(date: Date, time: string): Date {
    const minutes = this.parseTime(time);
    return new Date(
      date.getTime() +
        Math.floor(minutes / 60) * 3_600_000 +
        (minutes % 60) * 60_000,
    );
  }

  private validateEmployeeId(employeeId: number): void {
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      throw new BadRequestException(
        'El identificador del empleado debe ser un entero mayor que cero.',
      );
    }
  }

  private validateInterval(start: Date, end: Date): void {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException(
        'Las fechas de entrada y salida deben ser válidas.',
      );
    }

    if (end <= start) {
      throw new BadRequestException(
        'La fecha de salida debe ser posterior a la fecha de entrada.',
      );
    }
  }

  private validateWorkdayConfig(config: WorkdayConfig): void {
    const dayStart = this.parseTime(config.day_start);
    const dayEnd = this.parseTime(config.day_end);
    const nightStart = this.parseTime(config.night_start);
    const nightEnd = this.parseTime(config.night_end);

    if (dayStart >= dayEnd) {
      throw new BadRequestException(
        'La jornada diurna debe terminar después de iniciar.',
      );
    }

    if (nightStart === nightEnd) {
      throw new BadRequestException(
        'La configuración nocturna debe definir horarios distintos.',
      );
    }

    if (config.max_day_hours <= 0 || config.max_week_hours <= 0) {
      throw new BadRequestException(
        'Los máximos diarios y semanales deben ser mayores que cero.',
      );
    }

    const dayStartInDay = dayStart;
    const dayEndInDay = dayEnd;
    const nightStartInDay = nightStart;
    const nightEndInDay = nightEnd;
    const dayEndNormalized =
      dayEndInDay > dayStartInDay ? dayEndInDay : dayEndInDay + 24 * 60;
    const nightEndNormalized =
      nightEndInDay > nightStartInDay ? nightEndInDay : nightEndInDay + 24 * 60;

    if (
      dayStartInDay < nightEndNormalized &&
      nightStartInDay < dayEndNormalized
    ) {
      throw new BadRequestException(
        'La configuración nocturna no puede solaparse con la jornada diurna.',
      );
    }
  }
}
