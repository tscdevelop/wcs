import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { OrdersService } from '../services/orders.service';
import { Orders } from '../entities/orders.entity';

dotenv.config();

const ordersService = new OrdersService();

export const create = async (req: Request, res: Response) => {
    const operation = 'OrderController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<Orders> = DataSanitizer.fromObject<Orders>(req.body, Orders);

        const response = await ordersService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    const operation = 'OrderController.updateOrder';

    // ดึง username ของผู้ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ order_id จากพารามิเตอร์
    const order_id = req.params.order_id;
    if (!order_id) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // ทำ sanitize ข้อมูลจาก body
        const data: Partial<Orders> = DataSanitizer.fromObject<Orders>(req.body, Orders);
        // เรียก service update
        const response = await ordersService.updateOrder(order_id, data, reqUsername);

        // ส่งผลลัพธ์กลับ client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'OrderController.delete';

    // ดึง username ของผู้ทำการลบ
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const order_id = req.params.order_id;
    if (!order_id) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียก service delete
        const response = await ordersService.delete(order_id, reqUsername);

        // ส่งผลลัพธ์กลับ client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'OrderController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await ordersService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const getUsageAll = async (req: Request, res: Response) => {
    const operation = 'OrderController.getUsageAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await ordersService.getUsageAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const getUsageById = async (req: Request, res: Response) => {
    const operation = 'OrderController.getUsageById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const order_id_str = req.params.order_id;
    if (!order_id_str) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    // แปลง string เป็น number
    const order_id = Number(order_id_str);
    if (isNaN(order_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await ordersService.getUsageById(order_id); // ✅ now it's a number
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const getReceiptAll = async (req: Request, res: Response) => {
    const operation = 'OrderController.getReceiptAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await ordersService.getReceiptAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
    }
};

export const getReceiptById = async (req: Request, res: Response) => {
    const operation = 'OrderController.getReceiptById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const order_id_str = req.params.order_id;
    if (!order_id_str) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    // แปลง string เป็น number
    const order_id = Number(order_id_str);
    if (isNaN(order_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await ordersService.getReceiptById(order_id); // ✅ now it's a number
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.order', true, reqUsername);
    }
};
