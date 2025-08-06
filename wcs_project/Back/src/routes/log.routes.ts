import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as transactionLogController from '../controllers/log.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransactionLog
 *   description: การจัดการบันทึก Log ของ Transaction
 */

/**
 * @swagger
 * /api/transaction-log/create:
 *   post:
 *     summary: บันทึก Log ของ Transaction
 *     description: |
 *       ใช้สำหรับบันทึกข้อมูลประวัติของ Transaction ที่เกิดขึ้นในระบบ
 *       - 📌 **log_type** (ประเภทของ Transaction) → `INBOUND`, `OUTBOUND`
 *       - 📌 **log_ctgy** (ชื่อหมวดหมู่) → `RAW_MATERIAL`, `FINISHED_GOODS`, `TOOLING`, `SEMI`
 *       - 📌 **log_action** (ประเภทการดำเนินการ) → `CREATED`, `UPDATED`, `DELETED`, `RETURNED`
 *       - 📌 **ref_id** (ไอดีของรายการที่เกี่ยวข้อง) → เช่น `inbrm_id=1`
 *       - 📌 **transaction_data** (ข้อมูลทั้งหมด) → เช่น `{ "quantity": 50, "location": "Warehouse A" }`
 *     tags: [TransactionLog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - log_type
 *               - log_ctgy
 *               - log_action
 *               - ref_id
 *             properties:
 *               log_type:
 *                 type: string
 *                 description: ประเภทของ Transaction (INBOUND, OUTBOUND)
 *                 enum: [INBOUND, OUTBOUND]
 *                 example: "INBOUND"
 *               log_ctgy:
 *                 type: string
 *                 description: ชื่อหมวดหมู่ เช่น RAW_MATERIAL, FINISHED_GOODS, TOOLING, SEMI
 *                 enum: [RAW_MATERIAL, FINISHED_GOODS, TOOLING, SEMI]
 *                 example: "RAW_MATERIAL"
 *               log_action:
 *                 type: string
 *                 description: ประเภทการดำเนินการ (CREATED, UPDATED, DELETED, RETURNED)
 *                 enum: [CREATED, UPDATED, DELETED, RETURNED]
 *                 example: "CREATED"
 *               ref_id:
 *                 type: number
 *                 description: ไอดีรายการที่อ้างถึง
 *                 example: 1
 *               transaction_data:
 *                 type: object
 *                 description: ข้อมูลทั้งหมด
 *                 example: { "quantity": 50, "location": "Warehouse A" }
 *     responses:
 *       201:
 *         description: บันทึกข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create', authenticateToken, transactionLogController.create);

export default router;
