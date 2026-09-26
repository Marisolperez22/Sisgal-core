export type AuditResult = 'SUCCESS' | 'FAILED';

export interface AuditLog {
  action: string;
  module: string;
  resource: string;
  resourceId?: number;
  userId?: number;
  result: AuditResult;
  message: string;
  metadata?: Record<string, unknown>;
}