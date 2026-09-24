import { Branch } from '../../../../entities/branch.model';
import { Company } from '../../../../entities/company.model';
import { BranchRepositoryPort } from '../../domain/ports/branch.repository.port';
import { BranchService } from './branch.service';

describe('BranchService', () => {
  let service: BranchService;
  let mockRepository: jest.Mocked<BranchRepositoryPort>;

  const mockCompany: Company = {
    id: 1,
    name: 'SISGAL Corp',
    nit: '900123456-1',
    legal_rep: 'Juan Perez',
    branches: [],
  };

  const mockBranches: Branch[] = [
    {
      id: 1,
      name: 'Sucursal Norte',
      nit: '900123456-1',
      is_active: true,
      company: mockCompany,
      branchConfigs: [],
      employeeAssignments: [],
      biometricDevices: [],
      attendance_records: [],
    },
    {
      id: 2,
      name: 'Sucursal Sur',
      nit: '900123456-2',
      is_active: false,
      company: mockCompany,
      branchConfigs: [],
      employeeAssignments: [],
      biometricDevices: [],
      attendance_records: [],
    },
  ];

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn().mockResolvedValue(mockBranches),
      findById: jest.fn(),
      findByName: jest.fn(),
    };

    service = new BranchService(mockRepository);
  });

  describe('obtenerTodas', () => {
    it('debe retornar todas las sucursales (activas e inactivas) indicando su estado (CA01)', async () => {
      const resultado = await service.obtenerTodas();

      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(resultado).toHaveLength(2);

      expect(resultado[0].id).toBe(1);
      expect(resultado[0].name).toBe('Sucursal Norte');
      expect(resultado[0].is_active).toBe(true);
      expect(resultado[0].estado).toBe('ACTIVA');
      expect(resultado[0].companyName).toBe('SISGAL Corp');

      expect(resultado[1].id).toBe(2);
      expect(resultado[1].name).toBe('Sucursal Sur');
      expect(resultado[1].is_active).toBe(false);
      expect(resultado[1].estado).toBe('INACTIVA');
    });

    it('debe filtrar solo sucursales activas cuando soloActivas es true (CA06)', async () => {
      mockRepository.findAll.mockResolvedValue([mockBranches[0]]);

      const resultado = await service.obtenerTodas(true);

      expect(mockRepository.findAll).toHaveBeenCalledWith(true);
      expect(resultado).toHaveLength(1);
      expect(resultado[0].estado).toBe('ACTIVA');
      expect(resultado[0].is_active).toBe(true);
    });
  });
});
