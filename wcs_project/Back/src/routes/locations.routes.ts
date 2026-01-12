import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as locationController from '../controllers/locations.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: การจัดการรายการ location
 */
    
/**
 * @swagger
 * /api/locations/search-location:
 *   get:
 *     summary: ค้นหาข้อมูล location ด้วย loc และ box_loc
 *     description: ค้นหาสถานที่เก็บของ
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: loc
 *         schema:
 *           type: string
 *         description: ค้นหา location
 *       - in: query
 *         name: box_loc
 *         schema:
 *           type: string
 *         description: ค้นหา box location
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ location
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/search-location'
    , authenticateToken
    , locationController.searchLocations);

export default router;