// log.service.ts

import { AppDataSource } from '../config/app-data-source';
import { Log } from '../entities/s_log.entity';
import { LessThan } from 'typeorm';

// ฟังก์ชันสำหรับบันทึก Log ลงในฐานข้อมูล
export class LogService {
  private logRepository = AppDataSource.getRepository(Log);

  /**
   * บันทึก Log ลงในฐานข้อมูล
   * @param level ระดับของ Log (info, warn, error, ฯลฯ)
   * @param message ข้อความ Log
   * @param operation ชื่อฟังก์ชันหรือการดำเนินการที่เกี่ยวข้อง
   * @param username ชื่อผู้ใช้ที่เกี่ยวข้อง (ถ้ามี)
   */
  async logToDatabase(
    level: string,
    message: string,
    operation: string,
    username?: string
  ) {
    try {
      const log = new Log();
      log.level = level;
      log.message = message;
      log.operation = operation || 'N/A';
      log.username = username || 'system';'';
      log.timestamp = new Date();

      await this.logRepository.save(log); // บันทึก Log ลงในฐานข้อมูล
      console.log('Log saved successfully');
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  /**
   * ลบ Log ที่เก็บไว้นานกว่า 30 วัน
   */
  async deleteOldLogs(LessThanDay:number=30) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - LessThanDay);

      const deleteResult = await this.logRepository.delete({
        timestamp: LessThan(thirtyDaysAgo),
      });

      console.log(`Old logs deleted successfully! Total deleted: ${deleteResult.affected}`);
    } catch (error) {
      console.error('Error deleting old logs:', error);
    }
  }

}



