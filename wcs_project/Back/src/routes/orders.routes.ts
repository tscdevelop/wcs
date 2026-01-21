import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as orderController from '../controllers/orders.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Waiting
 *   description: การจัดการรายการ order
 */

/**
 * @swagger
 * /api/waiting/create:
 *   post:
 *     summary: สร้างรายการ order
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [RECEIPT, USAGE, RETURN, TRANSFER]
 *                 example: "USAGE"
 *
 *               item_id:
 *                 type: string
 *                 example: "1"
 *
 *               mc_code:
 *                 type: string
 *                 example: "1"
 *
 *               loc_id:
 *                 type: string
 *                 example: "1"
 *
 *               cond:
 *                 type: string
 *                 example: "CAPITAL"
 *
 *               plan_qty:
 *                 type: number
 *                 example: 1
 *
 *               usage:
 *                 type: object
 *                 description: ใช้เมื่อ type = USAGE
 *                 properties:
 *                   work_order:
 *                     type: string
 *                     example: "WO20251109-001"
 *                   usage_num:
 *                     type: string
 *                     example: "6999"
 *                   line:
 *                     type: string
 *                     example: "1"
 *                   usage_type:
 *                     type: string
 *                     example: "ISSUE"
 *                   split:
 *                     type: number
 *                     example: 0
 *
 *               receipt:
 *                 type: object
 *                 description: ใช้เมื่อ type = RECEIPT
 *                 properties:
 *                   cat_qty:
 *                     type: number
 *                     example: 0
 *                   recond_qty:
 *                     type: number
 *                     example: 0
 *                   unit_cost_handled:
 *                     type: number
 *                     format: float
 *                     example: 12500.50
 *                   contract_num:
 *                     type: string
 *                     example: "T23M311"
 *                   po_num:
 *                     type: string
 *                     example: "PO1094940"
 *                   object_id:
 *                     type: string
 *                     example: "61270"
 *
 *               return:
 *                 type: object
 *                 description: ใช้เมื่อ type = RETURN
 *                 properties:
 *                   usage_trx_id:
 *                     type: string
 *                     example: "1"
 *                   inv_id:
 *                     type: string
 *                     example: "1"
 *                   usage_id:
 *                     type: string
 *                     example: "1"
 *
 *               transfer:
 *                 type: object
 *                 description: ใช้เมื่อ type = TRANSFER
 *                 properties:
 *                   cat_qty:
 *                     type: number
 *                     example: 0
 *                   recond_qty:
 *                     type: number
 *                     example: 0
 *                   contract_num:
 *                     type: string
 *                     example: "T23M311"
 *                   po_num:
 *                     type: string
 *                     example: "PO1094940"
 *                   object_id:
 *                     type: string
 *                     example: "61270"
 *
 *     responses:
 *       201:
 *         description: สร้างข้อมูล order สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบ หรือไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูล
 *       500:
 *         description: เซิร์ฟเวอร์ผิดพลาด
 */
router.post('/create',
    authenticateToken,
    orderController.create
);


/**
 * @swagger
 * /api/waiting/update/{order_id}:
 *   put:
 *     summary: แก้ไขรายการ order ที่มีอยู่
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ order 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [RECEIPT, USAGE, RETURN, TRANSFER]
 *                 example: "USAGE"
 *
 *               item_id:
 *                 type: string
 *                 example: "1"
 *
 *               mc_code:
 *                 type: string
 *                 example: "1"
 *
 *               loc_id:
 *                 type: string
 *                 example: "1"
 *
 *               cond:
 *                 type: string
 *                 example: "CAPITAL"
 *
 *               plan_qty:
 *                 type: number
 *                 example: 1
 *
 *               usage:
 *                 type: object
 *                 description: ใช้เมื่อ type = USAGE
 *                 properties:
 *                   work_order:
 *                     type: string
 *                     example: "WO20251109-001"
 *                   usage_num:
 *                     type: string
 *                     example: "6999"
 *                   line:
 *                     type: string
 *                     example: "1"
 *                   usage_type:
 *                     type: string
 *                     example: "ISSUE"
 *                   split:
 *                     type: number
 *                     example: 0
 *
 *               receipt:
 *                 type: object
 *                 description: ใช้เมื่อ type = RECEIPT
 *                 properties:
 *                   cat_qty:
 *                     type: number
 *                     example: 0
 *                   recond_qty:
 *                     type: number
 *                     example: 0
 *                   unit_cost_handled:
 *                     type: number
 *                     format: float
 *                     example: 12500.50
 *                   contract_num:
 *                     type: string
 *                     example: "T23M311"
 *                   po_num:
 *                     type: string
 *                     example: "PO1094940"
 *                   object_id:
 *                     type: string
 *                     example: "61270"
 *
 *               return:
 *                 type: object
 *                 description: ใช้เมื่อ type = RETURN
 *                 properties:
 *                   usage_trx_id:
 *                     type: string
 *                     example: "1"
 *                   inv_id:
 *                     type: string
 *                     example: "1"
 *                   usage_id:
 *                     type: string
 *                     example: "1"
 *
 *               transfer:
 *                 type: object
 *                 description: ใช้เมื่อ type = TRANSFER
 *                 properties:
 *                   cat_qty:
 *                     type: number
 *                     example: 0
 *                   recond_qty:
 *                     type: number
 *                     example: 0
 *                   contract_num:
 *                     type: string
 *                     example: "T23M311"
 *                   po_num:
 *                     type: string
 *                     example: "PO1094940"
 *                   object_id:
 *                     type: string
 *                     example: "61270"
 *
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูล order สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล order ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:order_id'
    , authenticateToken
    , orderController.updateOrder);

/**
 * @swagger
 * /api/waiting/delete/{order_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการ order ตามไอดีรายการ order 
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ไอดีรายการ order ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการ order สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ order ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:order_id'
    , authenticateToken
    , orderController.del);

/**
 * @swagger
 * /api/waiting/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ order
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ order ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , orderController.getAll);

/**
 * @swagger
 * /api/waiting/get-usage-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ order เฉพาะ Type Usage
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
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
router.get('/get-usage-all'
    , authenticateToken
    , orderController.getUsageAll);

/**
 * @swagger
 * /api/waiting/get-usage-by-id/{order_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ order เฉพาะ Type Usage ตามไอดี
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ order
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-usage-by-id/:order_id'
    , authenticateToken
    , orderController.getUsageById);


/**
 * @swagger
 * /api/waiting/get-receipt-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ order เฉพาะ Type Receipt
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order receipt
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ order receipt ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-receipt-all'
    , authenticateToken
    , orderController.getReceiptAll);

/**
 * @swagger
 * /api/waiting/get-receipt-by-id/{order_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ order เฉพาะ Type Receipt ตามไอดี
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ order
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ order
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-receipt-by-id/:order_id'
    , authenticateToken
    , orderController.getReceiptById);

export default router;