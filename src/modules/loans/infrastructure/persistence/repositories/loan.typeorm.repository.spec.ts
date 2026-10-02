import { Repository } from 'typeorm';
import { EmployeeLoan } from 'src/entities';
import { LoanStatus } from '../../../enums/loan-status.enum';
import { LoanTypeOrmRepository } from './loan.typeorm.repository';

describe('LoanTypeOrmRepository', () => {
  const queryBuilder = {
    leftJoinAndSelect: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    getMany: jest.fn(),
  };
  const employeeLoanRepository = {
    createQueryBuilder: jest.fn(),
  };
  let repository: LoanTypeOrmRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.addOrderBy.mockReturnValue(queryBuilder);
    employeeLoanRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    repository = new LoanTypeOrmRepository(
      employeeLoanRepository as unknown as Repository<EmployeeLoan>,
    );
  });

  it('combina todos los filtros mediante AND y carga el empleado', async () => {
    queryBuilder.getMany.mockResolvedValue([]);

    await repository.findAll({
      empleadoId: 7,
      nombreEmpleado: 'maría pé',
      documento: '123456789',
      estado: LoanStatus.ACTIVO,
      fechaDesde: '2026-03-01',
      fechaHasta: '2026-03-31',
    });

    expect(employeeLoanRepository.createQueryBuilder).toHaveBeenCalledWith(
      'loan',
    );
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'loan.employee',
      'employee',
    );
    expect(queryBuilder.andWhere.mock.calls).toEqual([
      ['loan.employeeId = :empleadoId', { empleadoId: 7 }],
      [
        "CONCAT(employee.firstName, ' ', employee.lastName) ILIKE :nombreEmpleado",
        { nombreEmpleado: '%maría pé%' },
      ],
      ['employee.document = :documento', { documento: '123456789' }],
      ['loan.status = :estado', { estado: LoanStatus.ACTIVO }],
      ['loan.grantedAt >= :fechaDesde', { fechaDesde: '2026-03-01' }],
      ['loan.grantedAt <= :fechaHasta', { fechaHasta: '2026-03-31' }],
    ]);
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('consulta sin filtros cuando no se recibe ningún criterio', async () => {
    queryBuilder.getMany.mockResolvedValue([]);

    await repository.findAll({});

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });
});
