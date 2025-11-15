// routes/tasks.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import { OrchestratedTaskService } from '../services/tasks.service';
import { buildTasksController } from '../controllers/tasks.controller';

export default function createTasksRouter(orchestrator: OrchestratedTaskService) {
    const router = Router();
    const c = buildTasksController(orchestrator); // ผูก orchestrator เข้ากับ controller

/**
 * @swagger
 * tags:
 *   name: Execution
 *   description: จัดการงาน WCS (Orchestrated) สำหรับ T1M/T1
 */

/**
 * @swagger
 * /api/execution/create:
 *   post:
 *     summary: สร้างงานจาก order_id และเริ่มต้น flow อัตโนมัติ
 *     tags: [Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "ORD-001"
 *                 description: "รหัส order ที่ต้องการสร้างงาน"
 *     responses:
 *       201:
 *         description: งานถูกสร้างและเริ่ม process แล้ว
 *       400:
 *         description: ค่าที่ส่งมาไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้ยืนยันตัวตน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในระบบ
 */
router.post('/create', authenticateToken, c.create);

    // /**
    //  * @swagger
    //  * /api/execution/confirm/{taskId}:
    //  *   post:
    //  *     summary: ผู้ใช้กดยืนยันหลังหยิบเสร็จ (ระบบจะสั่งปิด/คืน ตาม flow)
    //  *     tags: [Execution]
    //  *     security:
    //  *       - bearerAuth: []
    //  *     parameters:
    //  *       - $ref: '#/components/parameters/lng'
    //  *       - in: path
    //  *         name: taskId
    //  *         schema:
    //  *           type: string
    //  *         required: true
    //  *         description: รหัสงาน (tasks.task_id)
    //  *     responses:
    //  *       200:
    //  *         description: รับยืนยันแล้ว และระบบเริ่มขั้นตอนถัดไป (เช่น ปิด aisle)
    //  *       400:
    //  *         description: ค่าที่ส่งมาไม่ถูกต้อง
    //  *       401:
    //  *         description: ไม่ได้ยืนยันตัวตน
    //  *       404:
    //  *         description: ไม่พบงาน
    //  *       500:
    //  *         description: เกิดข้อผิดพลาดภายในระบบ
    //  */
    // router.post('/confirm/:taskId', authenticateToken, c.confirm);

    /**
     * @swagger
     * /api/execution/change-to-waiting/{order_id}:
     *   post:
     *     summary: เปลี่ยนสถานะรายการ order จาก QUEUED เป็น WAITING
     *     tags: [Execution]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *       - in: path
     *         name: order_id
     *         required: true
     *         schema:
     *           type: string
     *         description: ไอดีรายการ order ที่ต้องการเปลี่ยนสถานะ
     *     responses:
     *       200:
     *         description: เปลี่ยนสถานะรายการ order สำเร็จ
     *       400:
     *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
     *       404:
     *         description: ไม่พบรายการ order
     *       500:
     *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
     */
    router.post(
        '/change-to-waiting/:order_id',
        authenticateToken,
        c.changeToWaiting
    );

    /**
     * @swagger
     * /api/execution/handle-order-item/{order_id}/{actual_qty}:
     *   post:
     *     summary: Ready to handle item
     *     tags: [Execution]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *       - in: path
     *         name: order_id
     *         required: true
     *         schema:
     *           type: string
     *         description: ไอดีรายการ order ที่ต้องการเปลี่ยนสถานะ
     *       - in: path
     *         name: actual_qty
     *         required: true
     *         schema:
     *           type: number
     *         description: ไอดีรายการ order ที่ต้องการเปลี่ยนสถานะ
     *     responses:
     *       200:
     *         description: เปลี่ยนสถานะรายการ order สำเร็จ
     *       400:
     *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
     *       404:
     *         description: ไม่พบรายการ order
     *       500:
     *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
     */
    router.post(
        '/handle-order-item/:order_id/:actual_qty',
        authenticateToken,
        c.handleOrderItem
    );

    
    /**
     * @swagger
     * /api/execution/get-all:
     *   get:
     *     summary: ดึงข้อมูล Execution ทั้งหมด
     *     tags: [Execution]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *     responses:
     *       200:
     *         description: พบข้อมูล Execution 
     *       400:
     *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
     *       404:
     *         description: ไม่พบข้อมูล Execution ที่ร้องขอ
     *       500:
     *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
     */
    router.get('/get-all', authenticateToken, c.getAll);

    return router;
}
