import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RecieptsService } from './reciepts.service';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reciepts')
export class RecieptsController {
  constructor(private readonly recieptsService: RecieptsService) {}

  @Post()
  create(@Body() createRecieptDto: CreateRecieptDto) {
    return this.recieptsService.create(createRecieptDto);
  }

  @Get()
  findAll() {
    return this.recieptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recieptsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecieptDto: UpdateRecieptDto) {
    return this.recieptsService.update(+id, updateRecieptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recieptsService.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
