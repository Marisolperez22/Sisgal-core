import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmployeeTypeOrmRepository } from './employee.typeorm.repository';
import { Employee } from 'src/entities/employee.model';

describe('EmployeeTypeOrmRepository', () => {
  let repository: EmployeeTypeOrmRepository;

  const employeeRepositoryMock = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeTypeOrmRepository,
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepositoryMock,
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
});
