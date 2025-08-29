import { Router } from 'express';
import * as mrsController from '../controllers/mrs.controller';
import { authenticateToken } from '../common/auth.token';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MRS
 *   description: Mobile Racks System Management
 */

/**
 * @swagger
 * /api/mrs/get-all:
 *   get:
 *     summary: Get all data
 *     tags: [MRS]
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
router.get('/get-all', authenticateToken, mrsController.getAll);

export default router;