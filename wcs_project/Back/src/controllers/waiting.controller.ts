import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { WaitingService } from '../services/waiting.service';
import { WaitingTasks } from '../entities/waiting_tasks.entity';

dotenv.config();

const waitingService = new WaitingService();

export const create = async (req: Request, res: Response) => {
    const operation = 'WaitingController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<WaitingTasks> = DataSanitizer.fromObject<WaitingTasks>(req.body, WaitingTasks);

        const response = await waitingService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const updateWaiting = async (req: Request, res: Response) => {
    const operation = 'WaitingController.updateWaiting';

    // ดึง username ของผู้ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ waiting_id จากพารามิเตอร์
    const waiting_id = req.params.waiting_id;
    if (!waiting_id) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // ทำ sanitize ข้อมูลจาก body
        const data: Partial<WaitingTasks> = DataSanitizer.fromObject<WaitingTasks>(req.body, WaitingTasks);
        // เรียก service update
        const response = await waitingService.updateWaiting(waiting_id, data, reqUsername);

        // ส่งผลลัพธ์กลับ client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'WaitingController.delete';

    // ดึง username ของผู้ทำการลบ
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const waiting_id = req.params.waiting_id;
    if (!waiting_id) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียก service delete
        const response = await waitingService.delete(waiting_id, reqUsername);

        // ส่งผลลัพธ์กลับ client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'WaitingController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await waitingService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const getUsageAll = async (req: Request, res: Response) => {
    const operation = 'WaitingController.getUsageAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await waitingService.getUsageAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const getUsageById = async (req: Request, res: Response) => {
    const operation = 'WaitingController.getUsageById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const waiting_id_str = req.params.waiting_id;
    if (!waiting_id_str) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    // แปลง string เป็น number
    const waiting_id = Number(waiting_id_str);
    if (isNaN(waiting_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await waitingService.getUsageById(waiting_id); // ✅ now it's a number
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const getReceiptAll = async (req: Request, res: Response) => {
    const operation = 'WaitingController.getReceiptAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await waitingService.getReceiptAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};

export const getReceiptById = async (req: Request, res: Response) => {
    const operation = 'WaitingController.getReceiptById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const waiting_id_str = req.params.waiting_id;
    if (!waiting_id_str) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    // แปลง string เป็น number
    const waiting_id = Number(waiting_id_str);
    if (isNaN(waiting_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await waitingService.getReceiptById(waiting_id); // ✅ now it's a number
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.waiting', true, reqUsername);
    }
};
