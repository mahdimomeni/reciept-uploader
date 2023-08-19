import { Injectable } from '@nestjs/common';
import { CreateRecieptDto } from './dto/create-reciept.dto';
import { UpdateRecieptDto } from './dto/update-reciept.dto';

@Injectable()
export class RecieptsService {
  create(createRecieptDto: CreateRecieptDto) {
    return 'This action adds a new reciept';
  }

  findAll() {
    return `This action returns all reciepts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reciept`;
  }

  update(id: number, updateRecieptDto: UpdateRecieptDto) {
    return `This action updates a #${id} reciept`;
  }

  remove(id: number) {
    return `This action removes a #${id} reciept`;
  }
}
