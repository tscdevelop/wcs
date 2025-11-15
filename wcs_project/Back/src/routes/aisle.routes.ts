import { Router } from 'express';
import * as aisleController from '../controllers/aisle.controller';
import { authenticateToken } from '../common/auth.token';
import { patch } from '.';
// import { manualControl } from '../controllers/aisle.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Aisle
 *   description: Aisle Management
 */

// /**
//  * @swagger
//  * /api/aisle/manual-control:
//  *   post:
//  *     summary: Manual open/close an aisle (via gateway) — body variant
//  *     description: Same as the path variant but accepts aisle_id in the body for convenience.
//  *     tags: [Aisle]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - $ref: '#/components/parameters/lng'
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [aisle_id, action]
//  *             properties:
//  *               aisle_id:
//  *                 type: string
//  *                 example: "A12"
//  *               action:
//  *                 type: string
//  *                 enum: [OPEN, CLOSE]
//  *                 example: CLOSE
//  *               mrs_id:
//  *                 type: string
//  *                 description: Force using a specific MRS (optional)
//  *                 example: "1"
//  *     responses:
//  *       200:
//  *         description: Manual control accepted
//  *       400:
//  *         description: Bad request
//  *       404:
//  *         description: Not found
//  *       409:
//  *         description: Conflict
//  *       500:
//  *         description: Internal server error
//  */
// router.post('/manual-control', authenticateToken, manualControl);

/**
 * @swagger
 * /api/aisle/get-all:
 *   get:
 *     summary: Get all data
 *     tags: [Aisle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: successful
 *       400:
 *         description: bad request
 *       404:
 *         description: not found
 *       500:
 *         description: internet server error
 */
router.get('/get-all', authenticateToken, aisleController.getAll);

/**
 * @swagger
 * /api/aisle/get-code-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายการ dropdown code
 *     tags: [Aisle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล dropdown code
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล dropdown code ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-code-dropdown'
    , authenticateToken
    , aisleController.getCodeDropdown);

export default router;