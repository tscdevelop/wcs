// controllers/tasks.controller.ts
import { Request, response, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import { OrchestratedTaskService } from '../services/tasks.service';
import { ApiResponse } from '../models/api-response.model';
import { CreateTaskDto } from '../dtos/tasks.dto';

export function buildTasksController(orchestrator: OrchestratedTaskService) {
    const create = async (req: Request, res: Response) => {
        const operation = 'TasksController.create';
        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) return ResponseUtils.handleBadRequest(res, 'Username required');

        try {
            const { order_id } = req.body as CreateTaskDto;
            if (!order_id) return ResponseUtils.handleBadRequest(res, 'order_id is required');

            const response = await orchestrator.createAndOpen(order_id, reqUsername);
            const status = response.isCompleted ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
            return ResponseUtils.handleCustomResponse(res, response, status);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.t1m_task', true, reqUsername);
        }
    };


    const getAll = async (req: Request, res: Response) => {
        const operation = 'TasksController.getAll';

        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) return;

        try {
            const response = await orchestrator.getAll();
            return ResponseUtils.handleResponse(res, response);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
        }
    };

    const changeToWaiting = async (req: Request, res: Response) => {
        const operation = 'TasksController.changeToWaiting';

        // ดึง username ของผู้เปลี่ยน status
        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
        }

        const order_id = req.params.order_id;
        if (!order_id) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        try {
            // เรียก service changeToWaiting
            const response = await orchestrator.changeToWaiting(order_id, reqUsername);

            // ส่งผลลัพธ์กลับ client
            return ResponseUtils.handleResponse(res, response);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorDelete(
                res,
                operation,
                error.message,
                'item.task',
                true,
                reqUsername
            );
        }
    };

    const handleOrderItem = async (req: Request, res: Response) => {
        const operation = 'TasksController.handleOrderItem';

        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
        }

        const order_id = req.params.order_id;
        if (!order_id) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // แปลง actual_qty เป็น number
        const actual_qty = Number(req.params.actual_qty);
        if (isNaN(actual_qty) || actual_qty < 0) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        try {
            const response = await orchestrator.handleOrderItem(order_id, actual_qty, reqUsername);
            return ResponseUtils.handleResponse(res, response);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorDelete(
                res,
                operation,
                error.message,
                'item.task',
                true,
                reqUsername
            );
        }
    };



    return { create, changeToWaiting, handleOrderItem , getAll};
}
