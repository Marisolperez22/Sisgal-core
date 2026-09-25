import { Injectable } from '@nestjs/common';
import { createLogger, Logger } from 'winston';

import { AuditLog } from '../../../application/ports/audit/audit-log';
import { AuditPort } from '../../../application/ports/audit/audit.port';

import {
  auditFormat,
  auditTransports,
} from './logging.config';

@Injectable()
export class WinstonAuditAdapter implements AuditPort {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: auditFormat,
      transports: auditTransports,
    });
  }

  log(event: AuditLog): void {
    this.logger.info('AUDIT_EVENT', event);
  }
}