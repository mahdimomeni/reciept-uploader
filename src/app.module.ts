import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillsModule } from './bills/bills.module';

@Module({
  imports: [BillsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
