import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './config/DataSource';
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
      TypeOrmModule.forRoot({...dataSourceOptions, autoLoadEntities: true}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
