import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as counterController from '../controllers/counter.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Counter
 *   description: การจัดการ counter
 */

// /**
//  * @swagger
//  * /api/counter/get-all-orders:
//  *   get:
//  *     summary: ดึงข้อมูล order รวม counter
//  *     tags: [Counter]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - $ref: '#/components/parameters/lng'
//  *       - in: query
//  *         name: isExecution
//  *         schema:
//  *           type: boolean
//  *         required: false
//  *         description: |
//  *           ถ้าเป็น true จะ filter status เฉพาะ PROCESSING | false จะ filter status ทุกสถานะ ยกเว้น PROCESSING | ไม่ใส่ = ทุกสถานะ
//  *       - in: query
//  *         name: store_type
//  *         schema:
//  *           type: string
//  *         required: false
//  *         description: filter ตาม store_type (ถ้าไม่ส่งจะดึงทั้งหมด)
//  *       - in: query
//  *         name: mc_code
//  *         schema:
//  *           type: string
//  *         required: false
//  *         description: filter ตาม mc_code (ถ้าไม่ส่งจะดึงทั้งหมด)
//  *     responses:
//  *       200:
//  *         description: พบข้อมูลorder รวม counter
//  *       400:
//  *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
//  *       404:
//  *         description: ไม่พบข้อมูลorder รวม counterที่ร้องขอ
//  *       500:
//  *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
//  */
// router.get('/get-all-orders'
//     , authenticateToken
//     , counterController.getOrderAll);

/**
 * @swagger
 * /api/counter/get-all-order-by-user:
 *   get:
 *     summary: ดึงข้อมูล counter + order ของ user ที่ login เท่านั้น
 *     tags: [Counter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล counter ของ user
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบ counter ของ user
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-order-by-user',
    authenticateToken,
    counterController.getOrderAllByUser
);

/**
 * @swagger
 * /api/counter/get-all-by-user:
 *   get:
 *     summary: ดึงข้อมูล counter ของ user ที่ login เท่านั้น
 *     tags: [Counter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล counter ของ user
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบ counter ของ user
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-by-user',
    authenticateToken,
    counterController.getCounterAllByUser
);


/**
 * @swagger
 * /api/counter/get-by-id/{counterId}:
 *   get:
 *     summary: ดึงข้อมูลรายการ counter
 *     tags: [Counter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: counterId
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ counter
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ counter
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:counterId'
    , authenticateToken
    , counterController.getByCounterId);

export default router;