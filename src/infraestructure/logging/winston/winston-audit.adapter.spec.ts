import { WinstonAuditAdapter } from './winston-audit.adapter';
import { AuditLog } from '../../../application/ports/audit/audit-log';

import { createLogger } from 'winston';

jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe('WinstonAuditAdapter', () => {
  let adapter: WinstonAuditAdapter;

  const loggerMock = {
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createLogger as jest.Mock).mockReturnValue(loggerMock);

    adapter = new WinstonAuditAdapter();
  });

  describe('constructor', () => {
    it('debe crear el logger de Winston', () => {
      expect(createLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('log', () => {
    it('debe registrar el evento de auditoría', () => {
      const event: AuditLog = {
        action: 'BRANCH_CREATED',
        module: 'SUCURSALES',
        resource: 'Branch',
        resourceId: 1,
        userId: 10,
        result: 'SUCCESS',
        message: 'Sucursal creada correctamente.',
        metadata: {
          name: 'Sucursal Centro',
        },
      };

      adapter.log(event);

      expect(loggerMock.info).toHaveBeenCalledWith(
        'AUDIT_EVENT',
        event,
      );
    });

    it('debe registrar eventos fallidos', () => {
      const event: AuditLog = {
        action: 'BRANCH_CREATE_FAILED',
        module: 'SUCURSALES',
        resource: 'Branch',
        resourceId: 1,
        userId: 10,
        result: 'FAILED',
        message: 'No fue posible crear la sucursal.',
      };

      adapter.log(event);

      expect(loggerMock.info).toHaveBeenCalledWith(
        'AUDIT_EVENT',
        event,
      );
    });

    it('debe permitir eventos sin campos opcionales', () => {
      const event: AuditLog = {
        action: 'BRANCH_CREATED',
        module: 'SUCURSALES',
        resource: 'Branch',
        result: 'SUCCESS',
        message: 'Sucursal creada correctamente.',
      };

      adapter.log(event);

      expect(loggerMock.info).toHaveBeenCalledWith(
        'AUDIT_EVENT',
        event,
      );
    });
  });
});