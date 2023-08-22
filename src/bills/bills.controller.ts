import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { BillsService } from './bills.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { GenerateAndSendBillDto } from './dto/generate-and-send-bill.dto';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {}))
  upload(@UploadedFile() file: Express.Multer.File) {
    this.billsService.upload(file);
  }

  @Post('generate')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="test.zip"')
  async generate(
    @Body() generateBillDto: GenerateBillDto,
  ): Promise<StreamableFile> {
    return await this.billsService.generate(generateBillDto);
  }

  @Post('generate-and-send')
  generateAndSend(@Body() generateAndSendBillDto: GenerateAndSendBillDto) {
    this.billsService.generateAndSend(generateAndSendBillDto);
  }

  @Post('revoke-from-csv')
  @UseInterceptors(FileInterceptor('file', {}))
  revokeFromCsv(@UploadedFile() file: Express.Multer.File) {
    this.billsService.revokeFromCsv(file);
  }
}
