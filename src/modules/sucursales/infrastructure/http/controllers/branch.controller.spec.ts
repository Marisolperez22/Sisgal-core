import { BranchResponseDto } from '../dtos/branch-response.dto';
import { BranchController } from './branch.controller';
import { BranchService } from '../../../application/services/branch.service';

describe('BranchController', () => {
  let controller: BranchController;
  let mockService: { obtenerTodas: jest.Mock };

  const mockResponse: BranchResponseDto[] = [
    {
      id: 1,
      name: 'Sucursal Principal',
      nit: '900123456-1',
      is_active: true,
      estado: 'ACTIVA',
      companyId: 1,
      companyName: 'Empresa Matriz',
    },
    {
      id: 2,
      name: 'Sucursal Inactiva',
      nit: '900123456-2',
      is_active: false,
      estado: 'INACTIVA',
      companyId: 1,
      companyName: 'Empresa Matriz',
    },
  ];

  beforeEach(() => {
    mockService = {
      obtenerTodas: jest.fn().mockResolvedValue(mockResponse),
    };

    controller = new BranchController(mockService as unknown as BranchService);
  });

  describe('GET /sucursales', () => {
    it('debe obtener todas las sucursales sin filtro cuando no se envía el parámetro activas (CA01)', async () => {
      const result = await controller.obtenerTodas();

      expect(mockService.obtenerTodas).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(2);
      expect(result[0].estado).toBe('ACTIVA');
      expect(result[1].estado).toBe('INACTIVA');
    });

    it('debe enviar soloActivas=true al servicio cuando el parámetro activas es "true" (CA06)', async () => {
      await controller.obtenerTodas('true');

      expect(mockService.obtenerTodas).toHaveBeenCalledWith(true);
    });

    it('debe enviar soloActivas=false al servicio cuando el parámetro activas es "false"', async () => {
      await controller.obtenerTodas('false');

      expect(mockService.obtenerTodas).toHaveBeenCalledWith(false);
    });
  });
});
