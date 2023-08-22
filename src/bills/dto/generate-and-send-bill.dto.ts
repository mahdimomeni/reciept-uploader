import { ApiProperty } from '@nestjs/swagger';

export class GenerateAndSendBillDto {
  @ApiProperty({
    description: 'The number of bills to generate and send',
    minimum: 1,
    default: 100,
    type: Number,
  })
  number: number;

  @ApiProperty({
    description: 'The serial of the bills to start from',
    minimum: 1,
    default: 10000,
    type: Number,
  })
  billSerialStart: number;

  @ApiProperty({
    description: 'The number records per request',
    minimum: 1,
    default: 100,
    type: Number,
  })
  recordsPerRequest: number;
}
