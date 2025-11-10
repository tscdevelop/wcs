import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as waitingController from '../controllers/waiting.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Waiting
 *   description: การจัดการรายการ waiting
 */

/**
 * @swagger
 * /api/waiting/create:
 *   post:
 *     summary: สร้างรายการ waiting
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               store_type:
 *                 type: string
 *                 enum: [T1, T1M]
 *                 description: ประเภทคลัง (T1 = WRS, T1M = MRS)
 *                 example: "T1M"
 *               type:
 *                 type: string
 *                 enum: [RECEIPT, USAGE, TRANSFER]
 *                 description: ประเภทงาน เช่น Receipt (Inbound), Usage (Outbound), Transfer
 *                 example: "USAGE"
 *               work_order:
 *                 type: string
 *                 description: หมายเลขออเดอร์/ใบคำขอ
 *                 example: "WO20251109-001"
 *               usage_num:
 *                 type: string
 *                 description: หมายเลขการใช้งาน (Usage Number)
 *                 example: "6999"
 *               line:
 *                 type: string
 *                 description: Line ของการทำงาน
 *                 example: "1"
 *               stock_item:
 *                 type: string
 *                 description: รหัสสินค้า (Stock Item)
 *                 example: "BHS-CRI-02034"
 *               item_desc:
 *                 type: string
 *                 description: รายละเอียดสินค้า
 *                 example: "Activation unit, right, p/n: 293B465"
 *               plan_qty:
 *                 type: integer
 *                 description: จำนวนที่ต้องการ
 *                 example: 1
 *               cat_qty:
 *                 type: integer
 *                 description: จำนวน cat
 *                 example: 0
 *               recond_qty:
 *                 type: integer
 *                 description: จำนวน recond
 *                 example: 0
 *               from_location:
 *                 type: string
 *                 description: ตำแหน่งต้นทาง (ชื่อรางเคลื่อนที่ใน MRS)
 *                 example: "LMC-M240-STORE (BHS)"
 *               usage_type:
 *                 type: string
 *                 description: ประเภทการใช้งาน เช่น ISSUE (Usage)
 *                 example: "ISSUE"
 *               cond:
 *                 type: string
 *                 description: สภาพสินค้า เช่น NEW หรือ CAPITAL
 *                 example: "CAPITAL"
 *               split:
 *                 type: integer
 *                 description: Split flag (0 = no split, 1 = split)
 *                 example: 0
 *               unit_cost_handled:
 *                 type: number
 *                 format: float
 *                 description: ราคาต่อหน่วย
 *                 example: 12500.50
 *               contract_num:
 *                 type: string
 *                 description: เลขที่สัญญา
 *                 example: "T23M311"
 *               po_num:
 *                 type: string
 *                 description: PO Number
 *                 example: "PO1094940"
 *               object_id:
 *                 type: string
 *                 description: Object ID
 *                 example: "61270"
 *     responses:
 *       201:
 *         description: สร้างข้อมูล waiting สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล waiting ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , waitingController.create);

/**
 * @swagger
 * /api/waiting/update/{waiting_id}:
 *   put:
 *     summary: แก้ไขรายการ waiting ที่มีอยู่
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: waiting_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ waiting 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               store_type:
 *                 type: string
 *                 enum: [T1, T1M]
 *                 description: ประเภทคลัง (T1 = WRS, T1M = MRS)
 *                 example: "T1M"
 *               type:
 *                 type: string
 *                 enum: [RECEIPT, USAGE, TRANSFER]
 *                 description: ประเภทงาน เช่น Receipt (Inbound), Usage (Outbound), Transfer
 *                 example: "USAGE"
 *               work_order:
 *                 type: string
 *                 description: หมายเลขออเดอร์/ใบคำขอ
 *                 example: "WO20251109-001"
 *               usage_num:
 *                 type: string
 *                 description: หมายเลขการใช้งาน (Usage Number)
 *                 example: "6999"
 *               line:
 *                 type: string
 *                 description: Line ของการทำงาน
 *                 example: "1"
 *               stock_item:
 *                 type: string
 *                 description: รหัสสินค้า (Stock Item)
 *                 example: "BHS-CRI-02034"
 *               item_desc:
 *                 type: string
 *                 description: รายละเอียดสินค้า
 *                 example: "Activation unit, right, p/n: 293B465"
 *               plan_qty:
 *                 type: integer
 *                 description: จำนวนที่ต้องการ
 *                 example: 1
 *               cat_qty:
 *                 type: integer
 *                 description: จำนวน cat
 *                 example: 0
 *               recond_qty:
 *                 type: integer
 *                 description: จำนวน recond
 *                 example: 0
 *               from_location:
 *                 type: string
 *                 description: ตำแหน่งต้นทาง (ชื่อรางเคลื่อนที่ใน MRS)
 *                 example: "LMC-M240-STORE (BHS)"
 *               usage_type:
 *                 type: string
 *                 description: ประเภทการใช้งาน เช่น ISSUE (Usage)
 *                 example: "ISSUE"
 *               cond:
 *                 type: string
 *                 description: สภาพสินค้า เช่น NEW หรือ CAPITAL
 *                 example: "CAPITAL"
 *               split:
 *                 type: integer
 *                 description: Split flag (0 = no split, 1 = split)
 *                 example: 0
 *               unit_cost_handled:
 *                 type: number
 *                 format: float
 *                 description: ราคาต่อหน่วย
 *                 example: 12500.50
 *               contract_num:
 *                 type: string
 *                 description: เลขที่สัญญา
 *                 example: "T23M311"
 *               po_num:
 *                 type: string
 *                 description: PO Number
 *                 example: "PO1094940"
 *               object_id:
 *                 type: string
 *                 description: Object ID
 *                 example: "61270"
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูล waiting สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล waiting ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:waiting_id'
    , authenticateToken
    , waitingController.updateWaiting);

/**
 * @swagger
 * /api/waiting/delete/{waiting_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการ waiting ตามไอดีรายการ waiting 
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: waiting_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ไอดีรายการ waiting ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการ waiting สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ waiting ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:waiting_id'
    , authenticateToken
    , waitingController.del);

/**
 * @swagger
 * /api/waiting/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ waiting
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ waiting 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ waiting ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , waitingController.getAll);

/**
 * @swagger
 * /api/waiting/get-usage-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ waiting เฉพาะ Type Usage
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ waiting usage
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ waiting usage ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-usage-all'
    , authenticateToken
    , waitingController.getUsageAll);

/**
 * @swagger
 * /api/waiting/get-usage-by-id/{waiting_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ waiting เฉพาะ Type Usage ตามไอดี
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: waiting_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ waiting
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ waiting
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-usage-by-id/:waiting_id'
    , authenticateToken
    , waitingController.getUsageById);


/**
 * @swagger
 * /api/waiting/get-receipt-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ waiting เฉพาะ Type Receipt
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ waiting receipt
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ waiting receipt ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-receipt-all'
    , authenticateToken
    , waitingController.getReceiptAll);

/**
 * @swagger
 * /api/waiting/get-receipt-by-id/{waiting_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ waiting เฉพาะ Type Receipt ตามไอดี
 *     tags: [Waiting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: waiting_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ไอดีรายการ waiting
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ waiting
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-receipt-by-id/:waiting_id'
    , authenticateToken
    , waitingController.getReceiptById);

export default router;