// controllers/tasks.controller.ts
import { Request, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import { OrchestratedTaskService } from '../services/tasks.service';
import { ApiResponse } from '../models/api-response.model';
import { CreateTaskItem } from '../dtos/tasks.dto';

export function buildTasksController(orchestrator: OrchestratedTaskService) {
    const create = async (req: Request, res: Response) => {
        const operation = 'TasksController.create';
        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());

        try {
            // ต้องเป็นอาร์เรย์เท่านั้น
            if (!Array.isArray(req.body)) {
                return ResponseUtils.handleBadRequest(res, lang.msg('request.body.must_be_array'));
            }

            // ✅ map req.body ให้ตรงกับ CreateTaskItem
            const items: CreateTaskItem[] = (req.body as any[])
                .map(x => {
                    if (!x || !x.stock_item) return null;

                    // ตรวจว่า store_type ถูกส่งมาหรือไม่
                    if (!x.store_type) throw new Error('field.store_type is required');

                    return {
                        waiting_id: x.waiting_id,
                        stock_item: String(x.stock_item),
                        plan_qty: x.plan_qty,
                        priority: x.priority,
                        type: x.type,
                        store_type: x.store_type,  // ✅ ต้องส่ง
                        from_location: x.from_location,
                    };
                })
                .filter(Boolean) as CreateTaskItem[];

            if (!items.length) {
                return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.stock_item'));
            }

            // ไม่ต้องห่อใน dto อีกแล้ว เพราะ createAndOpenBatch ของคุณตอนนี้รับ array โดยตรง
            const response: ApiResponse<any> = await orchestrator.createAndOpenBatch(items, reqUsername);

            const status = response.isCompleted ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
            return ResponseUtils.handleCustomResponse(res, response, status);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.t1m_task', true, reqUsername);
        }
    };

    const confirm = async (req: Request, res: Response) => {
        const operation = 'TasksController.confirm';
        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) return;

        try {
            const taskId = req.params.taskId;
            if (!taskId) return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.task_id'));
            const response = await orchestrator.confirm(taskId, reqUsername);
            return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
        } catch (error: any) {
            return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.task', true, reqUsername);
        }
    };

    const getAll = async (req: Request, res: Response) => {
        const operation = 'TasksController.getAll';

        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
        }

        try {
            const response = await orchestrator.getAll();
            return ResponseUtils.handleResponse(res, response);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.task', true, reqUsername);
        }
    };

    const deleteTask = async (req: Request, res: Response) => {
        const operation = 'TasksController.deleteTask';

        // ดึง username ของผู้ทำการลบ
        const reqUsername = RequestUtils.getUsernameToken(req, res);
        if (!reqUsername) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
        }

        const task_id = req.params.task_id;
        if (!task_id) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        try {
            // เรียก service deleteTask
            const response = await orchestrator.deleteTask(task_id, reqUsername);

            // ส่งผลลัพธ์กลับ client
            return ResponseUtils.handleResponse(res, response);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.task', true, reqUsername);
        }
    };

    return { create, confirm, getAll, deleteTask };
}
