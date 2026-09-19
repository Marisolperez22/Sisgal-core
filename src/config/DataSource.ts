import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config'
import { Employee } from '../entities/employee.model';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL,
  synchronize: false,
  entities: [Employee],
  ssl: { rejectUnauthorized: false },
  migrations: ['src/migrations/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

try {
  console.log('Data Source inicializado correctamente');
} catch (error) {
  console.error('Error durante la inicializacion', error);
}
