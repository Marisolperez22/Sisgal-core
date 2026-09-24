import { Repository } from 'typeorm';
import { Branch } from '../../../../../entities/branch.model';
import { BranchTypeOrmRepository } from './branch.typeorm.repository';

describe('BranchTypeOrmRepository', () => {
  let repository: BranchTypeOrmRepository;
  let mockTypeOrmRepo: jest.Mocked<Partial<Repository<Branch>>>;

  const mockBranches: Branch[] = [
    {
      id: 1,
      name: 'Sucursal 1',
      nit: '900123-1',
      is_active: true,
      company: null as any,
      branchConfigs: [],
      employeeAssignments: [],
      biometricDevices: [],
      attendance_records: [],
    },
    {
      id: 2,
      name: 'Sucursal 2',
      nit: '900123-2',
      is_active: false,
      company: null as any,
      branchConfigs: [],
      employeeAssignments: [],
      biometricDevices: [],
      attendance_records: [],
    },
  ];

  beforeEach(() => {
    mockTypeOrmRepo = {
      find: jest.fn().mockResolvedValue(mockBranches),
      findOne: jest.fn(),
    };

    repository = new BranchTypeOrmRepository(
      mockTypeOrmRepo as Repository<Branch>,
    );
  });

  describe('findAll', () => {
    it('debe consultar todas las sucursales ordenadas por nombre', async () => {
      const result = await repository.findAll();

      expect(mockTypeOrmRepo.find).toHaveBeenCalledWith({
        where: {},
        relations: { company: true },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockBranches);
    });

    it('debe filtrar por is_active cuando se envía el parámetro soloActivas', async () => {
      await repository.findAll(true);

      expect(mockTypeOrmRepo.find).toHaveBeenCalledWith({
        where: { is_active: true },
        relations: { company: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('debe buscar una sucursal por id', async () => {
      mockTypeOrmRepo.findOne = jest.fn().mockResolvedValue(mockBranches[0]);

      const result = await repository.findById(1);

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { company: true },
      });
      expect(result).toEqual(mockBranches[0]);
    });
  });
});
