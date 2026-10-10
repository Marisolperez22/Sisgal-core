
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { jest } from '@jest/globals';

import {
  SYSTEM_CONFIG_REPOSITORY_PORT,
  type SystemConfigRepositoryPort,
} from '../../domain/ports/system-config-repository.port';

import { LegalDeductionsService } from './legal-deductions.service';

describe('LegalDeductionsService', () => {
  let service: LegalDeductionsService;
  let configRepository: jest.Mocked<SystemConfigRepositoryPort>;

  const payrollDate = new Date('2026-03-31T12:00:00-05:00');

  beforeEach(() => {
    configRepository = {
      getValue: jest.fn(),
    } as jest.Mocked<SystemConfigRepositoryPort>;

    service = new LegalDeductionsService(configRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    describe('validaciones de entrada', () => {
      it.each([
        ['base negativa', -1],
        ['NaN', Number.NaN],
        ['infinito positivo', Number.POSITIVE_INFINITY],
        ['infinito negativo', Number.NEGATIVE_INFINITY],
      ])('debe rechazar una base inválida: %s', async (_description, base) => {
        await expect(
          service.calculate(base, payrollDate),
        ).rejects.toThrow(BadRequestException);

        expect(configRepository.getValue).not.toHaveBeenCalled();
      });

      it('debe rechazar una fecha inválida', async () => {
        await expect(
          service.calculate(1_000_000, new Date('fecha-inválida')),
        ).rejects.toThrow(BadRequestException);

        expect(configRepository.getValue).not.toHaveBeenCalled();
      });

      it('debe aceptar una base de cotización igual a cero', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(4)
          .mockResolvedValueOnce(4);

        const result = await service.calculate(0, payrollDate);

        expect(result).toEqual({
          contributionBase: 0,
          healthRate: 4,
          healthDeduction: 0,
          pensionRate: 4,
          pensionDeduction: 0,
          totalDeduction: 0,
        });
      });
    });

    describe('cálculo de deducciones', () => {
      it('debe calcular correctamente salud, pensión y total', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(4)
          .mockResolvedValueOnce(4);

        const result = await service.calculate(2_000_000, payrollDate);

        expect(result).toEqual({
          contributionBase: 2_000_000,
          healthRate: 4,
          healthDeduction: 80_000,
          pensionRate: 4,
          pensionDeduction: 80_000,
          totalDeduction: 160_000,
        });

        expect(configRepository.getValue).toHaveBeenNthCalledWith(
          1,
          'HEALTH_RATE',
          payrollDate,
        );

        expect(configRepository.getValue).toHaveBeenNthCalledWith(
          2,
          'PENSION_RATE',
          payrollDate,
        );
      });

      it('debe redondear la base y las deducciones a dos decimales', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(4)
          .mockResolvedValueOnce(4);

        const result = await service.calculate(100.126, payrollDate);

        expect(result).toEqual({
          contributionBase: 100.13,
          healthRate: 4,
          healthDeduction: 4.01,
          pensionRate: 4,
          pensionDeduction: 4.01,
          totalDeduction: 8.02,
        });
      });

      it('debe utilizar los porcentajes configurados para la fecha de liquidación', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(8)
          .mockResolvedValueOnce(10);

        const result = await service.calculate(1_000_000, payrollDate);

        expect(result.healthRate).toBe(8);
        expect(result.healthDeduction).toBe(80_000);
        expect(result.pensionRate).toBe(10);
        expect(result.pensionDeduction).toBe(100_000);
        expect(result.totalDeduction).toBe(180_000);
      });

      it('debe calcular correctamente cuando los porcentajes son cero', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);

        const result = await service.calculate(1_000_000, payrollDate);

        expect(result.healthDeduction).toBe(0);
        expect(result.pensionDeduction).toBe(0);
        expect(result.totalDeduction).toBe(0);
      });
    });

    describe('validación de configuración', () => {
      it.each([
        ['salud ausente', null, 4],
        ['pensión ausente', 4, null],
        ['ambas configuraciones ausentes', null, null],
      ])(
        'debe lanzar un error si falta la configuración: %s',
        async (_description, healthRate, pensionRate) => {
          configRepository.getValue
            .mockResolvedValueOnce(healthRate)
            .mockResolvedValueOnce(pensionRate);

          await expect(
            service.calculate(1_000_000, payrollDate),
          ).rejects.toThrow(InternalServerErrorException);
        },
      );

      it.each([
        ['salud negativa', -1, 4],
        ['pensión negativa', 4, -1],
        ['salud superior a 100', 101, 4],
        ['pensión superior a 100', 4, 101],
        ['salud NaN', Number.NaN, 4],
        ['pensión NaN', 4, Number.NaN],
        ['salud infinita', Number.POSITIVE_INFINITY, 4],
        ['pensión infinita', 4, Number.POSITIVE_INFINITY],
      ])(
        'debe rechazar porcentajes inválidos: %s',
        async (_description, healthRate, pensionRate) => {
          configRepository.getValue
            .mockResolvedValueOnce(healthRate)
            .mockResolvedValueOnce(pensionRate);

          await expect(
            service.calculate(1_000_000, payrollDate),
          ).rejects.toThrow(InternalServerErrorException);
        },
      );

      it('debe aceptar porcentajes iguales a 100', async () => {
        configRepository.getValue
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(100);

        const result = await service.calculate(1_000_000, payrollDate);

        expect(result.healthDeduction).toBe(1_000_000);
        expect(result.pensionDeduction).toBe(1_000_000);
        expect(result.totalDeduction).toBe(2_000_000);
      });
    });
  });
});
