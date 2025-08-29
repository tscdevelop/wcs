// controllers/tasks.controller.ts
import { Request, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import { OrchestratedTaskService } from '../services/tasks.service';
import { ApiResponse } from '../models/api-response.model';

type CreateTaskItem = { sku: string; qty?: string; priority?: number };
type CreateTaskBatchDto = { items: CreateTaskItem[] };

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

            const items: CreateTaskItem[] = (req.body as any[])
                .map(x => (x && x.sku ? { sku: String(x.sku), qty: x.qty, priority: x.priority } : null))
                .filter(Boolean) as CreateTaskItem[];

            if (!items.length) {
                return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.sku'));
            }

            const dto: CreateTaskBatchDto = { items };
            const response: ApiResponse<any> = await orchestrator.createAndOpenBatch(dto, reqUsername);

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


    return { create, confirm, getAll };
}
