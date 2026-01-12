import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as roleController from '../controllers/role.controller'
import * as orderController from '../controllers/orders.controller'
import * as aisleController from '../controllers/aisle.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dropdown
 *   description: การจัดการรายการ dropdown
 */

/**
 * @swagger
 * /api/dropdown/get-role-code:
 *   get:
 *     summary: ดึงข้อมูลรายการ dropdown role code
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล dropdown
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล dropdown ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-role-code'
    , authenticateToken
    , roleController.getRoleDropdown);

/**
 * @swagger
 * /api/dropdown/get-maintenance-code:
 *   get:
 *     summary: ดึงข้อมูลรายการ dropdown maintenance code
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล dropdown
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล dropdown ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-maintenance-code'
    , authenticateToken
    , orderController.getMcCodeDropdown);

/**
 * @swagger
 * /api/dropdown/get-aisle-code:
 *   get:
 *     summary: ดึงข้อมูลรายการ dropdown aisle code
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล dropdown
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล dropdown ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-aisle-code'
    , authenticateToken
    , aisleController.getCodeDropdown);

export default router;