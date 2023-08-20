import { Injectable, StreamableFile } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as archiver from 'archiver';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { createReadStream, createWriteStream, readdir, unlink } from 'node:fs';
import { join } from 'path';

@Injectable()
export class BillsService {
  async upload(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    workbook.eachSheet((worksheet) => {
      console.log(worksheet);
    });
    console.log(file);
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
          'A2799X',
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

    // for (let fileNum = 1; fileNum <= filesCount; fileNum++) {
    //   unlink(`generated/${fileNum}.xlsx`, (err) => {
    //     if (err) throw err;
    //     console.log(`${fileNum}.xlsx was deleted`);
    //   });
    // }

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
}
