import { Test, TestingModule } from '@nestjs/testing';
import { RecieptsService } from './reciepts.service';

describe('RecieptsService', () => {
  let service: RecieptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecieptsService],
    }).compile();

    service = module.get<RecieptsService>(RecieptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
