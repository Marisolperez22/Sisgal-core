import { ApiProperty } from '@nestjs/swagger';
import type {
  DayType,
  TimePeriod,
  WorkHourType,
} from '../../../application/services/payroll-hours.service';

export class ClassifiedHourResponseDto {
  @ApiProperty({ type: String, format: 'date-time' })
  start!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  end!: Date;

  @ApiProperty({ example: 5 })
  hours!: number;

  @ApiProperty({ enum: ['DIURNA', 'NOCTURNA'] })
  period!: TimePeriod;

  @ApiProperty({ enum: ['ORDINARY', 'SUNDAY', 'HOLIDAY'] })
  dayType!: DayType;

  @ApiProperty({ example: false })
  isExtra!: boolean;

  @ApiProperty({
    enum: [
      'ORDINARIA_DIURNA',
      'ORDINARIA_NOCTURNA',
      'EXTRA_DIURNA',
      'EXTRA_NOCTURNA',
      'DOMINICAL_DIURNA',
      'DOMINICAL_NOCTURNA',
      'EXTRA_DOMINICAL_DIURNA',
      'EXTRA_DOMINICAL_NOCTURNA',
    ],
  })
  type!: WorkHourType;

  @ApiProperty({ example: 1.25 })
  multiplier!: number;

  @ApiProperty({ example: 6.25 })
  adjustedHours!: number;
}
