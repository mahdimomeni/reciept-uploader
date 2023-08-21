import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
    HttpModule,
  ],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
