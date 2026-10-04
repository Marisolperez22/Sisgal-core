import { Repository } from 'typeorm';
import { DisabilityLeave } from 'src/entities/disability_leave.model';
import { DisabilityLeaveTypeOrmRepository } from './disability-leave.typeorm.repository';

describe('DisabilityLeaveTypeOrmRepository', () => {
  const queryBuilder = {
    leftJoinAndSelect: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    getMany: jest.fn(),
    getRawOne: jest.fn(),
  };
  const disabilityLeaveRepositoryMock = {
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  let repository: DisabilityLeaveTypeOrmRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.innerJoin.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.addSelect.mockReturnValue(queryBuilder);
    disabilityLeaveRepositoryMock.createQueryBuilder.mockReturnValue(
      queryBuilder,
    );

    repository = new DisabilityLeaveTypeOrmRepository(
      disabilityLeaveRepositoryMock as unknown as Repository<DisabilityLeave>,
    );
  });

  describe('save', () => {
    it('debe guardar el registro y retornar la entidad persistida', async () => {
      const disabilityLeave = { type: 'Enfermedad general' } as DisabilityLeave;
      const guardado = { id: 1, type: 'Enfermedad general' } as DisabilityLeave;

      disabilityLeaveRepositoryMock.save.mockResolvedValue(guardado);

      const resultado = await repository.save(disabilityLeave);

      expect(resultado).toEqual(guardado);
      expect(disabilityLeaveRepositoryMock.save).toHaveBeenCalledWith(
        disabilityLeave,
      );
    });
  });

  describe('findAll', () => {
    it('combina todos los filtros mediante AND', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll({
        employeeId: 5,
        employeeName: 'maría pé',
        document: '1020304050',
        positionId: 2,
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(disabilityLeaveRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'disabilityLeave',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'disabilityLeave.employee',
        'employee',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'employee.jobPosition',
        'jobPosition',
      );
      expect(queryBuilder.andWhere.mock.calls).toEqual([
        ['employee.id = :employeeId', { employeeId: 5 }],
        [
          "CONCAT(employee.\"firstName\", ' ', employee.\"lastName\") ILIKE :employeeName",
          { employeeName: '%maría pé%' },
        ],
        ['employee.document = :document', { document: '1020304050' }],
        ['jobPosition.id = :positionId', { positionId: 2 }],
        ['disabilityLeave.end_date >= :startDate', { startDate: '2026-09-01' }],
        ['disabilityLeave.start_date <= :endDate', { endDate: '2026-09-30' }],
      ]);
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });

    it('consulta sin filtros cuando no se recibe ningún criterio', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll({});

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('debe filtrar por estado Activo usando la fecha de finalización', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll({ status: 'Activo' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'disabilityLeave.end_date >= CURRENT_DATE',
      );
    });

    it('debe filtrar por estado Finalizado usando la fecha de finalización', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll({ status: 'Finalizado' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'disabilityLeave.end_date < CURRENT_DATE',
      );
    });
  });

  describe('getIndicators', () => {
    it('debe calcular en una consulta la cantidad y el total de días activos', async () => {
      queryBuilder.getRawOne.mockResolvedValue({
        activeCount: '3',
        totalActiveDays: '12',
      });

      const resultado = await repository.getIndicators();

      expect(resultado).toEqual({ activeCount: 3, totalActiveDays: 12 });
      expect(queryBuilder.select).toHaveBeenCalledWith(
        'COUNT(disabilityLeave.id)',
        'activeCount',
      );
      expect(queryBuilder.addSelect).toHaveBeenCalledWith(
        'COALESCE(SUM(disabilityLeave.total_days), 0)',
        'totalActiveDays',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'disabilityLeave.end_date >= CURRENT_DATE',
      );
    });

    it('debe retornar indicadores en cero cuando la agregación no tiene resultado', async () => {
      queryBuilder.getRawOne.mockResolvedValue(undefined);

      const resultado = await repository.getIndicators();

      expect(resultado).toEqual({ activeCount: 0, totalActiveDays: 0 });
    });
  });

  describe('findOverlapping', () => {
    it('debe consultar los períodos del empleado que se crucen con el rango dado', async () => {
      const registroExistente = { id: 9 } as DisabilityLeave;
      queryBuilder.getMany.mockResolvedValue([registroExistente]);

      const resultado = await repository.findOverlapping(
        5,
        '2026-09-04',
        '2026-09-10',
      );

      expect(resultado).toEqual([registroExistente]);
      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        'disabilityLeave.employee',
        'employee',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'employee.id = :employeeId',
        { employeeId: 5 },
      );
      expect(queryBuilder.andWhere.mock.calls).toEqual([
        ['disabilityLeave.start_date <= :endDate', { endDate: '2026-09-10' }],
        ['disabilityLeave.end_date >= :startDate', { startDate: '2026-09-04' }],
      ]);
    });
  });
});
