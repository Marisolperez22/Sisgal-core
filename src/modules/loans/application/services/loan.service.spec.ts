import { BadRequestException } from '@nestjs/common';
import { LoanStatus } from '../../enums/loan-status.enum';
import { LoanRepositoryPort } from '../../domain/ports/loan.repository.port';
import { LoanService } from './loan.service';

describe('LoanService', () => {
  const loanRepository: jest.Mocked<LoanRepositoryPort> = {
    findAll: jest.fn(),
  };
  let service: LoanService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LoanService(loanRepository);
  });

  it('consulta préstamos con todos los filtros y transforma la respuesta', async () => {
    const employeeLoan = {
      id: 1,
      employee: {
        id: 7,
        firstName: 'María',
        lastName: 'Pérez',
        document: '123456789',
      },
      totalAmount: '2500000.00',
      installmentAmount: '250000.00',
      totalInstallments: 10,
      pendingInstallments: 8,
      outstandingBalance: '2000000.00',
      grantedAt: new Date('2026-03-10T00:00:00.000Z'),
      status: LoanStatus.ACTIVO,
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      updatedAt: new Date('2026-03-10T00:00:00.000Z'),
    } as any;
    const filters = {
      empleadoId: 7,
      documento: '123456789',
      estado: LoanStatus.ACTIVO,
      fechaDesde: '2026-03-01',
      fechaHasta: '2026-03-31',
    };
    loanRepository.findAll.mockResolvedValue([employeeLoan]);

    const result = await service.obtenerTodos(filters);

    expect(loanRepository.findAll).toHaveBeenCalledWith(filters);
    expect(result[0]).toMatchObject({
      id: 1,
      employee: { id: 7, document: '123456789' },
      totalAmount: 2500000,
      status: LoanStatus.ACTIVO,
    });
  });

  it('rechaza un rango donde la fecha inicial es posterior a la final', async () => {
    await expect(
      service.obtenerTodos({
        fechaDesde: '2026-04-01',
        fechaHasta: '2026-03-31',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(loanRepository.findAll).not.toHaveBeenCalled();
  });
});
