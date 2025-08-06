import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../common/auth.token';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: การจัดการผู้ใช้งานระบบ
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: เข้าสู่ระบบผู้ใช้
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: รหัสผ่านสำหรับบัญชีผู้ใช้
 *                 example: 1234
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 token_expire:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: ข้อมูลรับรองไม่ถูกต้อง
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: สร้างผู้ใช้ใหม่
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: รหัสผ่านสำหรับบัญชีผู้ใช้ (ต้องมีตัวอักษรและตัวเลข)
 *                 example: password123
 *               role_code:
 *                 type: string
 *                 enum: [ADMIN, MANAGEMENT, MANAGER, OFFICER_PC, OFFICER_TL, OWNER]
 *                 description: บทบาทใหม่ของผู้ใช้
 *                 example: ADMIN
 *               is_active:
 *                 type: boolean
 *                 description: แสดงสถานะว่าบัญชีผู้ใช้ใช้งานอยู่หรือไม่ (true = ใช้งาน, false = ไม่ใช้งาน)
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: number
 *                 username:
 *                   type: string
 *                 role_code:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *                 create_date:
 *                   type: string
 *                 create_by:
 *                   type: string
 *                 update_date:
 *                   type: string
 *                 update_by:
 *                   type: string
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.post('/create'
, authenticateToken
, userController.create);

/**
 * @swagger
 * /api/users/update/{user_id}:
 *   put:
 *     summary: แก้ไขผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของผู้ใช้ที่ต้องการแก้ไข
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้ใหม่
 *                 example: new_username
 *               password:
 *                 type: string
 *                 description: รหัสผ่านใหม่สำหรับบัญชีผู้ใช้ (ต้องมีตัวอักษรและตัวเลข)
 *                 example: new1234
 *               role_code:
 *                 type: string
 *                 enum: [ADMIN, MANAGEMENT, MANAGER, OFFICER_PC, OFFICER_TL, OWNER]
 *                 description: บทบาทใหม่ของผู้ใช้
 *                 example: USER
 *               is_active:
 *                 type: boolean
 *                 description: แสดงสถานะว่าบัญชีผู้ใช้ใช้งานอยู่หรือไม่ (true = ใช้งาน, false = ไม่ใช้งาน)
 *                 example: true
 *     responses:
 *       204:
 *         description: แก้ไขสำเร็จ
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.put('/update/:user_id', authenticateToken, userController.update);

/**
 * @swagger
 * /api/users/change-password/{user_id}:
 *   put:
 *     summary: เปลี่ยนรหัสผ่านของผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสของผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: รหัสผ่านเดิมของผู้ใช้
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 description: รหัสผ่านใหม่ของผู้ใช้
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isCompleted:
 *                   type: boolean
 *                 isError:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ข้อความแจ้งเตือนการไม่ได้รับอนุญาต
 *       500:
 *         description: ข้อความแจ้งเตือนข้อผิดพลาดของเซิร์ฟเวอร์
 */
router.put('/change-password/:user_id'
    , authenticateToken
    , userController.changePassword);

/**
 * @swagger
 * /api/users/delete/{user_id}:
 *   delete:
 *     summary: ลบผู้ใช้
 *     tags: [Users]
*     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของผู้ใช้ที่ต้องการลบ
 *         example: 1
 *     responses:
 *       204:
 *         description: ลบสำเร็จ
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.delete('/delete/:user_id'
    , authenticateToken
    , userController.del);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: ค้นหาผู้ใช้
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อผู้ใช้ที่ต้องการค้นหา
 *         example: admin
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         required: false
 *         description: บทบาทของผู้ใช้ที่ต้องการค้นหา
 *         example: user
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: number
 *                   username:
 *                     type: string
 *                   role_code:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *                   create_date:
 *                     type: string
 *                   create_by:
 *                     type: string
 *                   update_date:
 *                     type: string
 *                   update_by:
 *                     type: string
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.get('/search'
    , authenticateToken
    , userController.search);

/**
 * @swagger
 * /api/users/get-by-user-id/{user_id}:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้งานระบบตาม user ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้งาน (user ID)
 *     responses:
 *       200:
 *         description: พบข้อมูลผู้ใช้งานระบบ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: พบข้อมูลผู้ใช้งานระบบน
 *                 data:
 *                   $ref: '#/components/schemas/s_user'
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ไม่พบข้อมูลผู้ใช้งานระบบน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลผู้ใช้งานระบบนตาม user ID
 */
router.get('/get-by-user-id/:user_id'
    , authenticateToken
    , userController.getByUserId);

/**
 * @swagger
 * /api/users/check-username:
 *   get:
 *     summary: ตรวจสอบว่า username มีในระบบหรือไม่
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: ชื่อผู้ใช้ที่ต้องการตรวจสอบ
 *         example: admin
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: true ถ้า username มีในระบบ, false ถ้าไม่มี
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.get('/check-username'
    , authenticateToken
    , userController.checkUsernameExists);

/**
 * @swagger
 * /api/users/get-user-token:
 *   get:
 *     summary: ดึงข้อมูล user จาก token
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: สำเร็จ
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.get('/get-user-token'
    , authenticateToken
    , userController.getUserToken);    

export default router;
