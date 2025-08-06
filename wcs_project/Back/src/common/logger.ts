// logger.ts
import winston from 'winston';
import { LogService } from '../services/log.service'; // Import LogService
import stream from 'stream';

// Enum สำหรับกำหนดระดับของ Log
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  SILLY = 'silly',
}

// สร้าง instance ของ LogService
const logService = new LogService();

// สร้าง Custom Writable Stream สำหรับ Winston
const logStream = new stream.Writable({
    write: (message: Buffer, encoding, next) => {
      const logInfo = JSON.parse(message.toString());
      logService
        .logToDatabase(
          logInfo.level, 
          logInfo.message, 
          logInfo.operation || 'N/A', // ตรวจสอบว่า operation มีค่าหรือไม่
          logInfo.username || 'system', // ตรวจสอบว่า username มีค่าหรือไม่
        )
        .finally(() => {
          next(); // เรียก next() เมื่อการเขียนเสร็จสมบูรณ์
        });
    },
  });
  
  // กำหนดการตั้งค่า Logger ด้วย Winston
  const logger = winston.createLogger({
    level: LogLevel.INFO, // ใช้ Enum LogLevel สำหรับการกำหนดระดับของ Log
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json() // กำหนดรูปแบบการบันทึกเป็น JSON
    ),
    transports: [
      new winston.transports.Console(), // บันทึก Log ลงคอนโซล
      new winston.transports.Stream({ stream: logStream }), // ใช้ Custom Writable Stream
      new winston.transports.File({ filename: 'logs/app.log' }), // บันทึก Log ลงไฟล์
    ],
  });
  
  export default logger; // ส่งออก Logger สำหรับใช้งานในส่วนอื่นของโปรเจกต์
  
