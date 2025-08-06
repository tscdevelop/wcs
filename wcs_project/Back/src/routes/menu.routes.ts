import express, { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { authenticateToken } from '../common/auth.token';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: เมนู
 */


/**
 * @swagger
 * /api/menus/get-menu-all:
 *   get:
 *     summary: ดึงเมนูในระบบ
 *     tags: 
 *       - Menu
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: พบข้อมูลสิทธิ์การใช้งานระบบ
 *       404:
 *         description: ไม่พบข้อมูลสิทธิ์การใช้งานระบบ
 *       400:
 *         description: เกิดข้อผิดพลาดในการค้นหาข้อมูลสิทธิ์การใช้งานระบบ
 */
router.get('/get-menu-all', authenticateToken, menuController.getMenuAll);

export default router;