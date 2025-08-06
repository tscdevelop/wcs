// delete-logs.job.ts
import cron from 'node-cron';
import { LogService } from '../services/log.service'; // Import LogService
import logger from '../common/logger'; // Import Logger จากไฟล์ logger.ts

// สร้าง instance ของ LogService
const logService = new LogService();


// การตั้งเวลา cron job เป็นสิ่งสำคัญที่ช่วยให้คุณสามารถกำหนดเวลาในการรันงานอัตโนมัติในระบบได้ โดยใช้รูปแบบการกำหนดเวลาเฉพาะที่เป็นที่นิยมใน Unix/Linux ซึ่งมีรูปแบบที่ยืดหยุ่นมาก

// รูปแบบการกำหนดเวลาใน Cron
// รูปแบบการกำหนดเวลาใน cron ประกอบด้วย 5 ช่อง ซึ่งแทนค่าตามลำดับดังนี้:

// scss
// คัดลอกโค้ด
// * * * * *
// │ │ │ │ │
// │ │ │ │ └── วันในสัปดาห์ (0 - 7) (Sunday คือ 0 หรือ 7)
// │ │ │ └──── เดือน (1 - 12)
// │ │ └────── วันในเดือน (1 - 31)
// │ └──────── ชั่วโมง (0 - 23)
// └────────── นาที (0 - 59)
// ตัวอย่างการตั้งค่า Cron
// 1. รันทุกนาที
// markdown
// คัดลอกโค้ด
// * * * * *
// 2. รันทุก 5 นาที
// markdown
// คัดลอกโค้ด
// */5 * * * *
// 3. รันทุกชั่วโมง
// คัดลอกโค้ด
// 0 * * * *
// 4. รันทุกวันเวลาเที่ยงคืน
// คัดลอกโค้ด
// 0 0 * * *
// 5. รันทุกวันตอน 9 โมงเช้า
// คัดลอกโค้ด
// 0 9 * * *
// 6. รันทุกวันจันทร์ถึงศุกร์ เวลา 10 โมงเช้า
// คัดลอกโค้ด
// 0 10 * * 1-5
// 7. รันทุกวันแรกของเดือน เวลาเที่ยงคืน
// คัดลอกโค้ด
// 0 0 1 * *
// 8. รันทุก 15 นาที ในช่วงเวลาทำงาน (9 โมงเช้าถึง 6 โมงเย็น)
// markdown
// คัดลอกโค้ด
// */15 9-18 * * *
// 9. รันทุกวันที่ 15 ของเดือน เวลาเที่ยงคืน
// คัดลอกโค้ด
// 0 0 15 * *
// 10. รันทุก 10 วินาที (เฉพาะบางระบบที่รองรับ)
// การรันทุกวินาทีไม่สามารถทำได้ใน cron มาตรฐาน แต่สามารถทำได้ในบางระบบที่รองรับ เช่น Quartz หรือการเขียนสคริปต์เพื่อทำงานใน loop:

// typescript
// คัดลอกโค้ด
// setInterval(() => {
//   console.log('Running every 10 seconds');
// }, 10000);
cron.schedule('0 0 * * *', async () => { // ตั้งเวลาให้ลบ Log ทุกวันเวลาเที่ยงคืน
  console.log('Running cron job to delete old logs');
  try {
    await logService.deleteOldLogs(); // ลบ log เก่า
    logger.info('Cron job completed: Old logs deleted successfully'); // บันทึก log
  } catch (error : any) {
    logger.error('Error during cron job execution:', { error: error.message }); // บันทึก error log
  }
});

