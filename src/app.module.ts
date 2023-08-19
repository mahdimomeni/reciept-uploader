import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecieptsModule } from './reciepts/reciepts.module';

@Module({
  imports: [RecieptsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
