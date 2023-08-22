import { Injectable, StreamableFile } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as archiver from 'archiver';
import * as moment from 'jalali-moment';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { createReadStream, createWriteStream, readdir, unlink } from 'node:fs';
import { join } from 'path';
import { HttpService } from '@nestjs/axios';
import { GenerateAndSendBillDto } from './dto/generate-and-send-bill.dto';
import { lastValueFrom } from 'rxjs';
import { parse } from 'csv-parse';

@Injectable()
export class BillsService {
  constructor(private readonly httpService: HttpService) {}

  async upload(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    const billsSheet = workbook.getWorksheet('اطلاعات صورت حساب');
    const productsSheet = workbook.getWorksheet('اقلام');

    billsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const billCreationDate = moment
        .from(row.getCell(11).value.toString(), 'fa', 'YYYY/MM/DD')
        .valueOf();
      const internalBillSerial = row.getCell(9).value;
      const cashPaymentPrice = row.getCell(7).value;
      const creditPaymentPrice = row.getCell(8).value;
      const customerEconomicNumber = row.getCell(6).value.toString();

      const header = {
        indatim: billCreationDate,
        inty: 'TYPE1',
        inno: internalBillSerial,
        setm: 'CASH',
        cap: cashPaymentPrice,
        insp: creditPaymentPrice,
        inp: 'SELL',
        ins: 'ORIGINAL',
        tob: 'LEGAL',
        tinb: customerEconomicNumber,
      };

      const body = [];

      productsSheet.eachRow((row) => {
        if (row.getCell(1).value !== rowNumber) return;

        body.push({
          sstid: row.getCell(2).value.toString(),
          sstt: row.getCell(6).value,
          mu: row.getCell(4).value,
          am: row.getCell(3).value,
          fee: row.getCell(5).value,
          dis: row.getCell(7).value,
          cop: row.getCell(8).value,
        });
      });

      this.httpService.post(
        'http://thirdparty.api.raahbardev.ir:8080/api/v1/invoice/submit',
        {
          records: [
            {
              values: {
                header: header,
                body: body,
                payment: [],
              },
            },
          ],
        },
        {
          headers: {
            Authorization:
              'Bearer 7036b0475e410ff340fb50e331b0b3ddd2dc9ba1d5de90de3e3997b1ea1c1b25',
          },
        },
      );
    });
  }

  async generate(generateBillDto: GenerateBillDto): Promise<StreamableFile> {
    const filesCount = generateBillDto.rows / generateBillDto.rowsPerFile;

    const todayDate = new Date();
    const fifteenDaysAgoDate = new Date();
    fifteenDaysAgoDate.setDate(fifteenDaysAgoDate.getDate() - 15);
    const timeDiff = todayDate.getTime() - fifteenDaysAgoDate.getTime();

    let billSerial = generateBillDto.billSerialStart;

    const output = createWriteStream(join(process.cwd(), `test.zip`));
    const archive = archiver('zip', {
      store: true,
    });
    archive.pipe(output);

    for (let fileNum = 1; fileNum <= filesCount; fileNum++) {
      const workbook = new ExcelJS.Workbook();

      const billsSheet = workbook.addWorksheet('اطلاعات صورتحساب');

      billsSheet.getRow(1).values = [
        'شناسه یکتای حافظه مالیاتی',
        'نوع صورتحساب',
        'الگوی صورتحساب',
        'نوع شخص خریدار',
        'روش تسویه',
        'شماره اقتصادی خریدار',
        'مبلغ پرداختی نقدی',
        'مبلغ پرداختی نسیه',
        'سریال صورتحساب داخلی حافظه مالیاتی',
        'شماره اقتصادی فروشنده',
        'تاریخ و زمان صدور صورت حساب',
      ];

      for (
        let rowNum = 2;
        rowNum <= generateBillDto.rowsPerFile + 1;
        rowNum++
      ) {
        const randomTime = Math.random() * timeDiff;
        const randomDate = new Date(fifteenDaysAgoDate.getTime() + randomTime);
        const randomDateStr = randomDate
          .toLocaleDateString('fa-IR-u-nu-latn')
          .slice(0, 10);

        billsSheet.getRow(rowNum).values = [
          'A16HD3',
          'نوع-یک',
          'فروش',
          'حقوقی',
          'نقد',
          '14011637397',
          1,
          0,
          billSerial,
          '14005354730',
          randomDateStr,
        ];

        billSerial++;
      }

      const productsSheet = workbook.addWorksheet('اقلام');

      productsSheet.getRow(1).values = [
        'شماره سطر صورت حساب',
        'شناسه کالا یا خدمت',
        'تعداد / مقدار',
        'واحد اندازه گیری',
        'مبلغ واحد',
        'شرح کالا / خدمت',
        'مبلغ تخفیف',
        'سهم نقدی از پرداخت',
      ];

      for (
        let rowNum = 2;
        rowNum <= generateBillDto.rowsPerFile + 1;
        rowNum++
      ) {
        productsSheet.getRow(rowNum).values = [
          rowNum,
          '2720000000050',
          1,
          'کیلوگرم',
          1,
          'باقلا خشک',
          0,
          1,
        ];
      }

      const filePath = join(process.cwd(), `generated/${fileNum}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      archive.append(createReadStream(filePath), { name: `${fileNum}.xlsx` });
    }

    archive.finalize();

    const file = createReadStream(join(process.cwd(), `test.zip`));

    const generatedPath = join(process.cwd(), `generated`);
    readdir(generatedPath, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        unlink(join(generatedPath, file), (err) => {
          if (err) throw err;
        });
      }
    });

    return new StreamableFile(file);
  }

  async generateAndSend(generateAndSendBillDto: GenerateAndSendBillDto) {
    const todayDate = new Date();
    const fifteenDaysAgoDate = new Date();
    fifteenDaysAgoDate.setDate(fifteenDaysAgoDate.getDate() - 15);
    const timeDiff = todayDate.getTime() - fifteenDaysAgoDate.getTime();

    const requestsTotalNumber =
      generateAndSendBillDto.number / generateAndSendBillDto.recordsPerRequest;

    for (let i = 0; i < requestsTotalNumber; i++) {
      const records = [];

      for (let x = 0; x < generateAndSendBillDto.recordsPerRequest; x++) {
        const randomTime = Math.random() * timeDiff;
        const randomDate = new Date(
          fifteenDaysAgoDate.getTime() + randomTime,
        ).valueOf();

        records.push({
          values: {
            header: {
              indatim: randomDate,
              inty: 'TYPE1',
              inno: generateAndSendBillDto.billSerialStart,
              setm: 'CASH',
              inp: 'SELL',
              ins: 'ORIGINAL',
              tob: 'LEGAL',
              tinb: '14011637397',
            },
            body: [
              {
                sstid: '2720000000050',
                sstt: 'باقلا خشک',
                mu: '164',
                am: 1,
                fee: 1,
                dis: 0,
              },
            ],
            payment: [],
          },
        });

        generateAndSendBillDto.billSerialStart++;
      }

      await lastValueFrom(
        this.httpService.post(
          'http://thirdparty.api.raahbardev.ir:8080/api/v1/invoice/submit',
          {
            records: records,
          },
          {
            headers: {
              Authorization:
                'Bearer 7036b0475e410ff340fb50e331b0b3ddd2dc9ba1d5de90de3e3997b1ea1c1b25',
            },
          },
        ),
      );
    }
  }

  async revokeFromCsv(file: Express.Multer.File) {
    createReadStream(file.path)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', function (row) {
        console.log(row);
      });
  }
}
