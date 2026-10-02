import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config'
import { Employee } from '../entities/employee.model';
import { AttendanceLog } from '../entities/attendance-log.model';
import { AttendanceRecord } from '../entities/attendance-record.model';
import { AttendanceRecordLog } from '../entities/attendance-record-log.model';
import { BiometricDevice } from '../entities/biometric-device.model';
import { BranchConfig } from '../entities/branch-config.model';
import { Branch } from '../entities/branch.model';
import { Company } from '../entities/company.model';
import { DisabilityLeave } from '../entities/disability_leave.model';
import { EmployeeBranchAssignment } from '../entities/employee-branch-assignment.model';
import { PayrollLine } from '../entities/payroll_line.model';
import { PayrollPeriod } from '../entities/payroll-period.model';
import { SystemConfig } from '../entities/system-config.model';
import { WorkRateConfig } from '../entities/work-rate-config.model';
import { WorkdayConfig } from '../entities/workday-config.model';
import { Position } from '../entities/position.model';
import { CreateCoreEntities1789782222297 } from '../migrations/1789782222297-CreateCoreEntities';
import { CreatePositionCatalog1790380800000 } from '../migrations/1790380800000-CreatePositionCatalog';
import { EmployeeLoan } from 'src/entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL,
  synchronize: false,
  entities: [
    Employee,
    AttendanceLog,
    AttendanceRecord,
    AttendanceRecordLog,
    BiometricDevice,
    BranchConfig,
    Branch,
    Company,
    DisabilityLeave,
    EmployeeBranchAssignment,
    PayrollLine,
    PayrollPeriod,
    SystemConfig,
    WorkRateConfig,
    WorkdayConfig,
    Position,
    EmployeeLoan
  ],
  ssl: { rejectUnauthorized: false },
  migrations: [
    CreateCoreEntities1789782222297,
    CreatePositionCatalog1790380800000,
  ],
};

export const AppDataSource = new DataSource(dataSourceOptions);

try {
  console.log('Data Source inicializado correctamente');
} catch (error) {
  console.error('Error durante la inicializacion', error);
}
