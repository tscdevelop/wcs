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
     *   name: Tasks
     *   description: จัดการงาน WCS (Orchestrated) สำหรับ T1M/T1
     */

    /**
     * @swagger
     * /api/tasks/create:
     *   post:
     *     summary: สร้างงานจาก SKU (ส่งเป็นอาร์เรย์เสมอ) และเริ่มต้น flow อัตโนมัติ
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               required: [sku]
     *               properties:
     *                 sku:
     *                   type: string
     *                   example: "M-ABC-001"
     *                 qty:
     *                   type: string
     *                   example: "2.000"
     *                 priority:
     *                   type: integer
     *                   minimum: 1
     *                   maximum: 9
     *                   example: 5
     *           examples:
     *             multi:
     *               summary: หลาย SKU (order_id เดียวกันทั้งชุด)
     *               value:
     *                 - { "sku": "M-ABC-001", "qty": "2.000", "priority": 5 }
     *                 - { "sku": "M-ABC-002", "qty": "2.000", "priority": 5 }
     *             single:
     *               summary: 1 SKU ก็ส่งเป็นอาร์เรย์ 1 ตัว
     *               value:
     *                 - { "sku": "M-ABC-002", "qty": "2.000", "priority": 5 }
     *     responses:
     *       201:
     *         description: งานถูกสร้าง/คิวแล้ว (EXECUTING/QUEUED ตาม bank)
     *       400:
     *         description: ค่าที่ส่งมาไม่ถูกต้อง
     *       401:
     *         description: ไม่ได้ยืนยันตัวตน
     *       500:
     *         description: เกิดข้อผิดพลาดภายในระบบ
     */
    router.post('/create', authenticateToken, c.create);

    /**
     * @swagger
     * /api/tasks/confirm/{taskId}:
     *   post:
     *     summary: ผู้ใช้กดยืนยันหลังหยิบเสร็จ (ระบบจะสั่งปิด/คืน ตาม flow)
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *       - in: path
     *         name: taskId
     *         schema:
     *           type: string
     *         required: true
     *         description: รหัสงาน (tasks.task_id)
     *     responses:
     *       200:
     *         description: รับยืนยันแล้ว และระบบเริ่มขั้นตอนถัดไป (เช่น ปิด aisle)
     *       400:
     *         description: ค่าที่ส่งมาไม่ถูกต้อง
     *       401:
     *         description: ไม่ได้ยืนยันตัวตน
     *       404:
     *         description: ไม่พบงาน
     *       500:
     *         description: เกิดข้อผิดพลาดภายในระบบ
     */
    router.post('/confirm/:taskId', authenticateToken, c.confirm);

    /**
     * @swagger
     * /api/tasks/get-all:
     *   get:
     *     summary: ดึงข้อมูล Tasks ทั้งหมด
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/lng'
     *     responses:
     *       200:
     *         description: พบข้อมูล Tasks 
     *       400:
     *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
     *       404:
     *         description: ไม่พบข้อมูล Tasks ที่ร้องขอ
     *       500:
     *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
     */
router.get('/get-all', authenticateToken, c.getAll);

    return router;
}
