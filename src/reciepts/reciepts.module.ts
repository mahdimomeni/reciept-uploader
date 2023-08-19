import { Module } from '@nestjs/common';
import { RecieptsService } from './reciepts.service';
import { RecieptsController } from './reciepts.controller';

@Module({
  controllers: [RecieptsController],
  providers: [RecieptsService],
})
export class RecieptsModule {}
