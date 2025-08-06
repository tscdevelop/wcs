import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper';
import RequestUtils from '../utils/RequestUtils';
import { DataSanitizer } from '../utils/DataSanitizer';
import { ApiResponse } from '../models/api-response.model';
import { MenuService } from '../services/menu.service';
import { MenuModel } from '../models/menu.model';

dotenv.config();

const menuService = new MenuService();

// Controller สำหรับการดึงข้อมูล เมนู ทั้งหมด
export const getMenuAll = async (req: Request, res: Response) => {
    const operation = 'MenuController.getMenuAll';
    // รับ username จาก token ที่แนบมากับ request
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // เรียกใช้ service สำหรับดึงข้อมูล เมนู
        const response = await menuService.getMenuAll();
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // หากเกิดข้อผิดพลาด ส่งข้อความแจ้งกลับไปยัง client
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.menu', true, reqUsername);
    }
};
