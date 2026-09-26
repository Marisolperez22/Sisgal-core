import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

import { AuditLog } from '../../../application/ports/audit/audit-log';
import { AuditPort } from '../../../application/ports/audit/audit.port';

@Injectable()
export class WinstonAuditAdapter implements AuditPort {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: 'logs/audit.log',
        }),
      ],
    });
  }

  log(event: AuditLog): void {
    this.logger.info('AUDIT_EVENT', event);
  }
}