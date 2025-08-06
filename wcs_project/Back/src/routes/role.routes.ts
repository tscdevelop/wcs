import express, { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { authenticateToken } from '../common/auth.token';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: สิทธิ์การใช้งานระบบ
 */

/**
 * @swagger
 * /api/roles/create:
 *   post:
 *     summary: สร้างสิทธิ์การใช้งานระบบใหม่
 *     tags:
 *       - Role
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
 *             required:
 *               - role_code
 *               - role_name
 *               - permission_menus
 *             properties:
 *               role_code:
 *                 type: string
 *                 description: รหัสของ Role (ห้ามซ้ำ)
 *                 example: TEST
 *               role_name:
 *                 type: string
 *                 description: ชื่อของ Role
 *                 example: ทดสอบสิทธิ์
 *               role_description:
 *                 type: string
 *                 description: รายละเอียดของ Role
 *                 example: สำหรับทดสอบระบบ
 *               role_is_active:
 *                 type: boolean
 *                 description: สถานะของ Role (active/inactive)
 *                 example: true
 *               permission_menus:
 *                 type: string
 *                 description: JSON string ของรายการเมนูและ actions ที่เกี่ยวข้องกับ Role
 *                 example: '[{"menu_id":1,"permission_actions":["ACT_EDIT","ACT_VIEW"]}]'
 *     responses:
 *       201:
 *         description: สร้าง Role สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 *       409:
 *         description: รหัส Role ซ้ำ
 *       500:
 *         description: เกิดข้อผิดพลาดในการสร้าง Role
 */
router.post('/create', authenticateToken, roleController.create);

/**
 * @swagger
 * /api/roles/update/{role_code}:
 *   put:
 *     summary: แก้ไขข้อมูลสิทธิ์การใช้งานระบบ
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของ Role ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *               - permission_menus
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: ชื่อของ Role
 *                 example: ทดสอบสิทธิ์
 *               role_description:
 *                 type: string
 *                 description: รายละเอียดของ Role
 *                 example: สำหรับทดสอบระบบ
 *               role_is_active:
 *                 type: boolean
 *                 description: สถานะของ Role (active/inactive)
 *                 example: true
 *               permission_menus:
 *                 type: string
 *                 description: JSON string ของรายการเมนูและ actions ที่เกี่ยวข้องกับ Role
 *                 example: '[{"menu_id":1,"permission_actions":["ACT_EDIT","ACT_VIEW"]}]'
 *     responses:
 *       200:
 *         description: แก้ไข Role สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 *       404:
 *         description: ไม่พบ Role ที่ต้องการแก้ไข
 *       500:
 *         description: เกิดข้อผิดพลาดในการแก้ไข Role
 */
router.put('/update/:role_code', authenticateToken, roleController.update);

/**
 * @swagger
 * /api/roles/delete/{role_code}:
 *   delete:
 *     summary: ลบสิทธิ์การใช้งานระบบ
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของ Role ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบ Role สำเร็จ
 *       404:
 *         description: ไม่พบ Role ที่ต้องการลบ
 *       500:
 *         description: เกิดข้อผิดพลาดในการลบ Role
 */
router.delete('/delete/:role_code', authenticateToken, roleController.del);

/**
 * @swagger
 * /api/roles/search:
 *   get:
 *     summary: ค้นหาสิทธิ์การใช้งานระบบ
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: role_code
 *         schema:
 *           type: string
 *         description: สิทธิ์การใช้งานระบบ
 *       - in: query
 *         name: role_name
 *         schema:
 *           type: string
 *         description: ชื่อของRole
 *     responses:
 *       200:
 *         description: พบข้อมูลสิทธิ์การใช้งานระบบ
 *       404:
 *         description: ไม่พบข้อมูลสิทธิ์การใช้งานระบบ
 *       400:
 *         description: เกิดข้อผิดพลาดในการค้นหาข้อมูลสิทธิ์การใช้งานระบบ
 */
router.get('/search', authenticateToken, roleController.search);

/**
 * @swagger
 * /api/roles/check-role:
 *   get:
 *     summary: ตรวจสอบว่า role_code มีในระบบหรือไม่
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: role_code
 *         schema:
 *           type: string
 *         required: true
 *         description: รหัส Role ที่ต้องการตรวจสอบ
 *         example: ADMIN
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
 *                   description: true ถ้า role_code มีในระบบ, false ถ้าไม่มี
 *       400:
 *         description: ข้อความแจ้งเตือนการส่งข้อมูลไม่ถูกต้อง
 */
router.get('/check-role', authenticateToken, roleController.checkCodeExists);

/**
 * @swagger
 * /api/roles/get/{role_code}:
 *   get:
 *     summary: ดึงข้อมูล Role โดยใช้ role_code
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของ Role ที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: พบข้อมูล Role
 *       404:
 *         description: ไม่พบข้อมูล Role
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 */
router.get('/get/:role_code', authenticateToken, roleController.getByRoleCode);

/**
 * @swagger
 * /api/roles/getRolePermission/{role_code}:
 *   get:
 *     summary: ดึงข้อมูล PermissionRole โดยใช้ role_code
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของ Role ที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: พบข้อมูล Role
 *       404:
 *         description: ไม่พบข้อมูล Role
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 */
router.get('/getRolePermission/:role_code', authenticateToken, roleController.getPermissionByRole);

/**
 * @swagger
 * /api/roles/getMenuPermission/{role_code}:
 *   get:
 *     summary: ดึงข้อมูล PermissionMenu โดยใช้ role_code
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         schema:
 *           type: string
 *           description: รหัสของ Role ที่ต้องการดึงข้อมูล
 *           default: "" 
 *     responses:
 *       200:
 *         description: พบข้อมูล Role
 *       404:
 *         description: ไม่พบข้อมูล Role
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 */
router.get('/getMenuPermission/:role_code', authenticateToken, roleController.getMenuByPermission);

/**
 * @swagger
 * /api/roles/getPermissionAction/{role_code}/{menu_id}:
 *   get:
 *     summary: ดึงข้อมูล Permission Action โดยใช้ role_code และ menu_id
 *     tags: 
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: role_code
 *         schema:
 *           type: string
 *           description: รหัสของ Role ที่ต้องการดึงข้อมูล
 *           example: ADMIN
 *       - in: path
 *         name: menu_id
 *         schema:
 *           type: integer
 *           description: รหัสของเมนูที่ต้องการดึงสิทธิ์การทำงาน
 *           example: 2
 *     responses:
 *       200:
 *         description: พบข้อมูล Permission Action
 *       404:
 *         description: ไม่พบข้อมูล Permission Action
 *       400:
 *         description: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
 */
router.get('/getPermissionAction/:role_code/:menu_id', authenticateToken, roleController.getPermissionAction);

export default router;
