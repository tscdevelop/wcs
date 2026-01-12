import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as allOrderController from '../controllers/all_orders.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: การจัดการรายการ order ทั้งหมด
 */

/**
 * @swagger
 * /api/orders/get-usage-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ order filter status / store_type / mc_code
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: isExecution
 *         schema:
 *           type: boolean
 *         required: false
 *         description: |
 *           ถ้าเป็น true จะ filter status เฉพาะ WAITING | false จะ filter status ทุกสถานะ ยกเว้น WAITING และ FINISHED/COMPLETED | ไม่ใส่ = ทุกสถานะ
 *       - in: query
 *         name: store_type
 *         schema:
 *           type: string
 *         required: false
 *         description: filter ตาม store_type (ถ้าไม่ส่งจะดึงทั้งหมด)
 *       - in: query
 *         name: mc_code
 *         schema:
 *           type: string
 *         required: false
 *         description: filter ตาม mc_code (ถ้าไม่ส่งจะดึงทั้งหมด)
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order usage
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ order usage ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get(
    '/get-usage-all',
    authenticateToken,
    allOrderController.getUsageAll
);

/**
 * @swagger
 * /api/orders/get-status-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ order status filter status / store_type / mc_code / type
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: isExecution
 *         schema:
 *           type: boolean
 *         required: false
 *         description: |
 *           ถ้าเป็น true จะ filter status เฉพาะ WAITING | false จะ filter status ทุกสถานะ ยกเว้น WAITING | ไม่ใส่ = ทุกสถานะ
 *       - in: query
 *         name: store_type
 *         schema:
 *           type: string
 *         required: false
 *         description: filter ตาม store_type (ถ้าไม่ส่งจะดึงทั้งหมด)
 *       - in: query
 *         name: mc_code
 *         schema:
 *           type: string
 *         required: false
 *         description: filter ตาม mc_code (ถ้าไม่ส่งจะดึงทั้งหมด)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: filter ตาม type (ถ้าไม่ส่งจะดึงทั้งหมด) | RECEIPT | USAGE | TRANSFER
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order status
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ order status ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get(
    '/get-status-all',
    authenticateToken,
    allOrderController.getStatusAll
);


export default router;