import { ApiProperty } from '@nestjs/swagger';

export class GenerateBillDto {
  @ApiProperty({
    description: 'The number of rows to generate',
    minimum: 1,
    default: 100,
    type: Number,
  })
  rows: number;

  @ApiProperty({
    description: 'The number of rows per files',
    minimum: 1,
    default: 100,
    type: Number,
  })
  rowsPerFile: number;

  @ApiProperty({
    description: 'The serial of the bills to start from',
    minimum: 1,
    default: 10000,
    type: Number,
  })
  billSerialStart: number;
}
