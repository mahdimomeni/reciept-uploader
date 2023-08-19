import { Test, TestingModule } from '@nestjs/testing';
import { RecieptsController } from './reciepts.controller';
import { RecieptsService } from './reciepts.service';

describe('RecieptsController', () => {
  let controller: RecieptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecieptsController],
      providers: [RecieptsService],
    }).compile();

    controller = module.get<RecieptsController>(RecieptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
