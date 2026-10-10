export const SYSTEM_CONFIG_REPOSITORY_PORT =
  'SYSTEM_CONFIG_REPOSITORY_PORT';

export interface SystemConfigRepositoryPort {
  getValue(
    key: string,
    payrollDate: Date,
  ): Promise<number | null>;
}