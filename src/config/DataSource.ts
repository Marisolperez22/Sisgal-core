import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config'
import { Employee } from '../entities/employee.model';
import { AttendanceLog } from 'src/entities/attendance-log.model';
import { AttendanceRecord } from 'src/entities/attendance-record.model';
import { AttendanceRecordLog } from 'src/entities/attendance-record-log.model';
import { BiometricDevice } from 'src/entities/biometric-device.model';
import { BranchConfig } from 'src/entities/branch-config.model';
import { Branch } from 'src/entities/branch.model';
import { Company } from 'src/entities/company.model';
import { DisabilityLeave } from 'src/entities/disability_leave.model';
import { EmployeeBranchAssignment } from 'src/entities/employee-branch-assignment.model';
import { PayrollLine } from 'src/entities/payroll_line.model';
import { PayrollPeriod } from 'src/entities/payroll-period.model';
import { SystemConfig } from 'src/entities/system-config.model';
import { WorkRateConig } from 'src/entities/work-rate-config.model';
import { WorkdayConfig } from 'src/entities/workday-config.model';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL,
  synchronize: false,
  entities: [Employee, AttendanceLog, AttendanceRecord, AttendanceRecordLog,
    BiometricDevice, BranchConfig, Branch, Company, DisabilityLeave, EmployeeBranchAssignment,
    PayrollLine, PayrollPeriod, SystemConfig, WorkRateConig, WorkdayConfig
   ],
  ssl: { rejectUnauthorized: false },
  migrations: ['src/migrations/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

try {
  console.log('Data Source inicializado correctamente');
} catch (error) {
  console.error('Error durante la inicializacion', error);
}
