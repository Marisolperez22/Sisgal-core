import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './config/DataSource';
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmployeeModule } from './modules/empleados/employee.module';

@Module({
  imports: [
      TypeOrmModule.forRoot({...dataSourceOptions }),
      EmployeeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
