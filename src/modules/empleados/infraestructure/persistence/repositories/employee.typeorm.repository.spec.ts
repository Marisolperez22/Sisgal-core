import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmployeeTypeOrmRepository } from './employee.typeorm.repository';
import { Employee } from 'src/entities/employee.model';
import { AttendanceRecord } from 'src/entities/attendance-record.model';
import { PayrollPeriod } from 'src/entities/payroll-period.model';
import { DisabilityLeave } from 'src/entities/disability_leave.model';

describe('EmployeeTypeOrmRepository', () => {
  let repository: EmployeeTypeOrmRepository;

  const employeeRepositoryMock = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const attendanceRecordRepositoryMock = { count: jest.fn() };
  const payrollPeriodRepositoryMock = { count: jest.fn() };
  const disabilityLeaveRepositoryMock = { count: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeTypeOrmRepository,
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepositoryMock,
        },
        {
          provide: getRepositoryToken(AttendanceRecord),
          useValue: attendanceRecordRepositoryMock,
        },
        {
          provide: getRepositoryToken(PayrollPeriod),
          useValue: payrollPeriodRepositoryMock,
        },
        {
          provide: getRepositoryToken(DisabilityLeave),
          useValue: disabilityLeaveRepositoryMock,
        },
      ],
    }).compile();

    repository = module.get<EmployeeTypeOrmRepository>(
      EmployeeTypeOrmRepository,
    );
  });

  describe('save', () => {
    it('debe guardar el empleado y retornar la entidad persistida', async () => {
      const empleado = { firstName: 'Juan' } as Employee;
      const guardado = { id: 1, firstName: 'Juan' } as Employee;

      employeeRepositoryMock.save.mockResolvedValue(guardado);

      const resultado = await repository.save(empleado);

      expect(resultado).toEqual(guardado);
      expect(employeeRepositoryMock.save).toHaveBeenCalledWith(empleado);
    });
  });

  describe('findByDocument', () => {
    it('debe buscar el empleado por documento', async () => {
      const empleado = { id: 1, document: '1020304050' } as Employee;

      employeeRepositoryMock.findOne.mockResolvedValue(empleado);

      const resultado = await repository.findByDocument('1020304050');

      expect(resultado).toEqual(empleado);
      expect(employeeRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { document: '1020304050' },
      });
    });

    it('debe retornar null cuando no existe un empleado con ese documento', async () => {
      employeeRepositoryMock.findOne.mockResolvedValue(null);

      const resultado = await repository.findByDocument('999');

      expect(resultado).toBeNull();
    });
  });

  describe('deactivate', () => {
    it('debe actualizar el estado del empleado a INACTIVO', async () => {
      employeeRepositoryMock.update.mockResolvedValue(undefined);

      await repository.deactivate(1);

      expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: 'INACTIVO' },
      );
    });
  });

  describe('hasHistoricalRecords', () => {
    it('debe retornar true cuando el empleado tiene asistencias registradas', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(1);
      payrollPeriodRepositoryMock.count.mockResolvedValue(0);
      disabilityLeaveRepositoryMock.count.mockResolvedValue(0);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(true);
    });

    it('debe retornar true cuando el empleado tiene periodos de nómina registrados', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(0);
      payrollPeriodRepositoryMock.count.mockResolvedValue(1);
      disabilityLeaveRepositoryMock.count.mockResolvedValue(0);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(true);
    });

    it('debe retornar true cuando el empleado tiene incapacidades registradas', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(0);
      payrollPeriodRepositoryMock.count.mockResolvedValue(0);
      disabilityLeaveRepositoryMock.count.mockResolvedValue(1);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando el empleado no tiene registros históricos', async () => {
      attendanceRecordRepositoryMock.count.mockResolvedValue(0);
      payrollPeriodRepositoryMock.count.mockResolvedValue(0);
      disabilityLeaveRepositoryMock.count.mockResolvedValue(0);

      const resultado = await repository.hasHistoricalRecords(1);

      expect(resultado).toBe(false);
      expect(attendanceRecordRepositoryMock.count).toHaveBeenCalledWith({
        where: { employee: { id: 1 } },
      });
      expect(payrollPeriodRepositoryMock.count).toHaveBeenCalledWith({
        where: { employee: { id: 1 } },
      });
      expect(disabilityLeaveRepositoryMock.count).toHaveBeenCalledWith({
        where: { employee: { id: 1 } },
      });
    });
  });
});
