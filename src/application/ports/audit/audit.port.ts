import { AuditLog } from './audit-log';

export const AUDIT_PORT = Symbol('AUDIT_PORT');

export interface AuditPort {
  log(event: AuditLog): void;
}