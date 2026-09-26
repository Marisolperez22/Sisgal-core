export interface AuditLog {
  action: string;
  module: string;
  resource: string;
  resourceId?: number;
  userId?: number;
  result: 'SUCCESS' | 'FAILED';
  message: string;
  metadata?: Record<string, unknown>;
}