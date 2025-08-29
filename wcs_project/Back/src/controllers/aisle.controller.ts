import { Request, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import { AisleService } from '../services/aisle.service';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';

import dotenv from 'dotenv';
import { DataSanitizer } from '../utils/DataSanitizer';
import { Aisle } from '../entities/aisle.entity';

dotenv.config();

const aisleService = new AisleService();

export const updateControl = async (req: Request, res: Response) => {
    const operation = 'AisleController.updateControl'; // เดิมเป็น AreaController

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        console.log('Raw req.body:', req.body);

        // เดิมคุณ sanitize ทั้ง body
        const body = DataSanitizer.fromObject<Aisle>(req.body, Aisle);

        // รองรับทั้ง path param และ body (เผื่อ transition)
        const aisleIdFromPath = req.params.aisle_id ? Number(req.params.aisle_id) : undefined;

        const data: Partial<Aisle> = {
        aisle_id: (aisleIdFromPath ?? body.aisle_id) as any,
        // normalize สถานะให้เป็นตัวใหญ่เพื่อเทียบ enum ได้ชัวร์
        status: typeof body.status === 'string' ? (body.status as string).toUpperCase() as any : body.status,
        };

        const response = await aisleService.updateControl(data, reqUsername);

        // อัปเดต -> 200 OK (ไม่ใช่ 201)
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        // ถ้าไม่มี handleErrorUpdate ก็ใช้ของเดิมได้
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.aisle', true, reqUsername);
    }
};


export const getAll = async (req: Request, res: Response) => {
    const operation = 'AisleController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await aisleService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.aisle', true, reqUsername);
    }
};