import { DataSource } from 'typeorm';

class CodeGenerator {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  // ตัวอย่างการเรียกใช้คลาส CodeGenerator
  /**  
    // Import CodeGenerator ก่อนเรียกใช้
    import CodeGenerator from '../utils/CodeGenerator';
    
    // ประกาศ New CodeGenerator โดยส่ง AppDataSource เข้าไป
    const codeGenerator = new CodeGenerator(AppDataSource);
    
    // ต.ย.1
    const newHospitalCode = await codeGenerator.generateCode('m_hospital', 'hospital_code', 'HOSP', '', 'PREFIX000x');
    console.log(newHospitalCode); // ผลลัพธ์: HOSP0001
    // ต.ย.2
    const newEmployeeCode = await codeGenerator.generateCode('employee', 'emp_code', 'E', '', 'PREFIX-TH(YY)-000x');
    console.log(newEmployeeCode); // ผลลัพธ์: E-67-0001
    // ต.ย.3
    const newCustomerCode = await codeGenerator.generateCode('customer', 'customer_code', 'C', '', 'PREFIX-SUBFIX-TH(YY)-000x');
    console.log(newCustomerCode); // ผลลัพธ์: C-67-0001
  
  */

  /**
   * ฟังก์ชั่นสำหรับสร้างรหัสใหม่ตามพารามิเตอร์ที่กำหนด
   * @param table_name กำหนด ชื่อ ตารางที่ต้องการ Gen code เช่น "m_hospital"
   * @param field_name กำหนด ชื่อ ฟิล์ดที่ต้องการ Gen code เช่น "hospital_code"
   * @param prefix กำหนด ตัวอักษร ขึ้นต้น เช่น "HSP"
   * @param subfix กำหนด ตัวอักษร ย่อย เช่น "BRN"
   * @param format กำหนด รูปแบบการ Gen code โดยสามารถกำหนด 
   * เป็นรูปแบบ วันที่ได้ เช่น TH(yyyy) = ปี ถ้าครอบด้วยวงเล็บ TH หมายถึง ปี พ.ศ. 
   * แต่ถ้าไม่ครอบด้วยวงเล็บ จะเป็นปี ค.ศ. , MM = เดือน, DD = วัน, HH = ชั่วโมง, mm=นาที, ss=วินาที, 
   * 000x= เลขศูนย์นำหน้า 3 ตัวอักษร x คือเลขรันนิ่ง 
   * เช่น "[PREFIX]-[TH(YY)]-[000x]-[SUBFIX]"
   * @returns รหัสใหม่ตามรูปแบบที่กำหนด เช่น "HSP-67-0003-BRN"
   * @throws Error เมื่อ format ไม่ถูกต้อง
   */
  public async generateCode(
    table_name: string,
    field_name: string,
    prefix: string,
    subfix: string,
    format: string
  ): Promise<string> {
    // ตรวจสอบความถูกต้องของ format
    const formatPattern = /\[(PREFIX|SUBFIX|TH\(YYYY\)|TH\(YY\)|YYYY|YY|MM|DD|HH|mm|ss|0+x)\]/g;
    if (!formatPattern.test(format)) {
      throw new Error("Format ไม่ถูกต้อง");
    }

    // ฟังก์ชั่นสำหรับแปลงปีไทย
    const toThaiYear = (date: Date) => date.getFullYear() + 543;

    // ฟังก์ชั่นสำหรับแปลง format
    const formatDate = (format: string): string => {
      const date = new Date();
      const year = date.getFullYear();
      const thaiYear = toThaiYear(date);
      const replacements: { [key: string]: string } = {
        'YYYY': year.toString(),
        'YY': year.toString().slice(-2),
        'TH(YYYY)': thaiYear.toString(),
        'TH(YY)': thaiYear.toString().slice(-2),
        'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
        'DD': date.getDate().toString().padStart(2, '0'),
        'HH': date.getHours().toString().padStart(2, '0'),
        'mm': date.getMinutes().toString().padStart(2, '0'),
        'ss': date.getSeconds().toString().padStart(2, '0')
      };
      return format.replace(/\[(YYYY|YY|TH\(YYYY\)|TH\(YY\)|MM|DD|HH|mm|ss)\]/g, match => replacements[match.slice(1, -1)]);
    };

    // ค้นหา record ล่าสุด
    const lastRecord = await this.dataSource
      .getRepository(table_name)
      .createQueryBuilder(table_name)
      .orderBy(`${table_name}.${field_name}`, 'DESC')
      .getOne();

    console.log('lastRecord:', lastRecord);

    let newCodeNumber = 1;
    if (lastRecord) {
      const lastCode = lastRecord[field_name];
      console.log('lastCode:', lastCode);
      const runningPattern = /\[0+x\]/g;
      const match = runningPattern.exec(format);
      console.log('match:', match);
      if (match) {
        const runningLength = match[0].length - 2; // number of zeros + 1 for 'x'
        const runningIndex = format.indexOf(match[0]);
        
        // Calculate the fixed part length in the lastCode
        const fixedPart = format.slice(0, runningIndex)
          .replace(/\[PREFIX\]/g, prefix)
          .replace(/\[SUBFIX\]/g, subfix)
          .replace(/\[TH\(YYYY\)\]/g, toThaiYear(new Date()).toString())
          .replace(/\[TH\(YY\)\]/g, toThaiYear(new Date()).toString().slice(-2))
          .replace(/\[YYYY\]/g, new Date().getFullYear().toString())
          .replace(/\[YY\]/g, new Date().getFullYear().toString().slice(-2))
          .replace(/\[MM\]/g, (new Date().getMonth() + 1).toString().padStart(2, '0'))
          .replace(/\[DD\]/g, new Date().getDate().toString().padStart(2, '0'))
          .replace(/\[HH\]/g, new Date().getHours().toString().padStart(2, '0'))
          .replace(/\[mm\]/g, new Date().getMinutes().toString().padStart(2, '0'))
          .replace(/\[ss\]/g, new Date().getSeconds().toString().padStart(2, '0'));

        const fixedPartLength = fixedPart.length;
        console.log('fixedPart:', fixedPart);
        console.log('fixedPartLength:', fixedPartLength);

        const lastRunningNumber = lastCode.slice(fixedPartLength, fixedPartLength + runningLength);
        console.log('lastRunningNumber:', lastRunningNumber);
        newCodeNumber = parseInt(lastRunningNumber) + 1;
      }
    }

    console.log('newCodeNumber:', newCodeNumber);

    // แทนค่ารูปแบบวันที่
    let formattedCode = formatDate(format);
    console.log('formattedCode:', formattedCode);

    // แทนค่าเลขรันนิ่ง
    formattedCode = formattedCode.replace(/\[0+x\]/g, match => {
      const zeroCount = match.length - 2; // number of zeros + 1 for 'x'
      return newCodeNumber.toString().padStart(zeroCount, '0');
    });

    console.log('formattedCode + running:', formattedCode);

    // แทนค่า PREFIX และ SUBFIX
    formattedCode = formattedCode.replace(/\[PREFIX\]/g, prefix);
    console.log('formattedCode + PREFIX:', formattedCode);
    formattedCode = formattedCode.replace(/\[SUBFIX\]/g, subfix);
    console.log('formattedCode + SUBFIX:', formattedCode);

    // สร้างโค้ดใหม่
    const newCode = formattedCode;
    console.log('newCode:', newCode);

    return newCode;
  }
}

export default CodeGenerator;