import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import * as systemConfigRepositoryPort from '../../domain/ports/system-config-repository.port';

import { LegalDeductionsResult } from '../../domain/interfaces/legal-deductions-result.interface';

@Injectable()
export class LegalDeductionsService {
  constructor(
    @Inject(systemConfigRepositoryPort.SYSTEM_CONFIG_REPOSITORY_PORT)
    private readonly configRepository: systemConfigRepositoryPort.SystemConfigRepositoryPort,
  ) {}

  async calculate(
    contributionBase: number,
    payrollDate: Date,
  ): Promise<LegalDeductionsResult> {
    if (
      !Number.isFinite(contributionBase) ||
      contributionBase < 0
    ) {
      throw new BadRequestException(
        'La base de cotización debe ser un valor válido no negativo.',
      );
    }

    if (Number.isNaN(payrollDate.getTime())) {
      throw new BadRequestException(
        'La fecha de liquidación no es válida.',
      );
    }

    const [healthRate, pensionRate] = await Promise.all([
      this.configRepository.getValue(
        'HEALTH_RATE',
        payrollDate,
      ),
      this.configRepository.getValue(
        'PENSION_RATE',
        payrollDate,
      ),
    ]);

    if (healthRate === null || pensionRate === null) {
      throw new InternalServerErrorException(
        'No existe una configuración vigente para salud o pensión en la fecha de liquidación.',
      );
    }

    if (
      !Number.isFinite(healthRate) ||
      !Number.isFinite(pensionRate) ||
      healthRate < 0 ||
      healthRate > 100 ||
      pensionRate < 0 ||
      pensionRate > 100
    ) {
      throw new InternalServerErrorException(
        'Los porcentajes configurados para las deducciones legales no son válidos.',
      );
    }

    const base = this.roundCurrency(contributionBase);

    const healthDeduction = this.roundCurrency(
      base * (healthRate / 100),
    );

    const pensionDeduction = this.roundCurrency(
      base * (pensionRate / 100),
    );

    return {
      contributionBase: base,
      healthRate,
      healthDeduction,
      pensionRate,
      pensionDeduction,
      totalDeduction: this.roundCurrency(
        healthDeduction + pensionDeduction,
      ),
    };
  }

  private roundCurrency(value: number): number {
    return Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100;
  }
}