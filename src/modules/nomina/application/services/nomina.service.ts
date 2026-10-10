import { Injectable } from '@nestjs/common';
import { PayrollHoursService } from './payroll-hours.service';

@Injectable()
export class NominaService {
  constructor(
    private readonly payrollHoursService: PayrollHoursService,
  ) {}

  // Aquí se coordinarán los cálculos de nómina.
}