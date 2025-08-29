import { Router } from 'express';
import * as aisleController from '../controllers/aisle.controller';
import { authenticateToken } from '../common/auth.token';
import { patch } from '.';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Aisle
 *   description: Aisle Management
 */

/**
 * @swagger
 * /api/aisle/{aisle_id}:
 *   patch:
 *     summary: Update aisle status (Manual Control)
 *     description: Update status to OPEN/CLOSED/BLOCKED
 *     tags: [Aisle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: aisle_id
 *         in: path
 *         required: true
 *         description: Aisle ID
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED, BLOCKED]
 *                 example: "CLOSED"
 *     responses:
 *       200:
 *         description: updated successful
 *       400:
 *         description: bad request
 *       404:
 *         description: aisle not found
 *       409:
 *         description: conflict
 *       500:
 *         description: internal server error
 */
router.patch('/:aisle_id', authenticateToken, aisleController.updateControl);


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

export default router;