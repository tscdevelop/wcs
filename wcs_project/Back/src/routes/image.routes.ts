import { Router } from 'express';
import { getImageUpload } from '../controllers/image.controller'; // นำเข้า getimage function

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: การจัดการรูปภาพ
 */

/**
 * @swagger
 * /api/images/getImageUpload/{directory}/{subfolder}/{imageName}:
 *   get:
 *     summary: ดึงรูปภาพจากเซิร์ฟเวอร์
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: directory
 *         required: true
 *         schema:
 *           type: string
 *           enum: [stock_items_image]
 *         description: เส้นทางของรูปภาพบนเซิร์ฟเวอร์
 *         example: "stock_items_image"
 *       - in: path
 *         name: subfolder
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อของ subfolder ที่มีรูปภาพ
 *         example: "1"
 *       - in: path
 *         name: imageName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อไฟล์รูปภาพ
 *         example: "tool.png"
 *     responses:
 *       200:
 *         description: ส่งคืนไฟล์รูปภาพ
 *       400:
 *         description: เส้นทางรูปภาพไม่ถูกต้อง
 *       500:
 *         description: ข้อผิดพลาดในการส่งไฟล์
 */
router.get('/getImageUpload/:directory/:subfolder/:imageName', getImageUpload);

export default router;