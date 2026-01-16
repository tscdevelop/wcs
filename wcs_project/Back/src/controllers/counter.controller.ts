import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import { CounterService } from '../services/counter.service';
import * as lang from '../utils/LangHelper'; // ใช้ helper function

dotenv.config();

const counterService = new CounterService();

export const getOrderAllByUser = async (req: Request, res: Response) => {
    const operation = 'counterController.getOrderAllByUser';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const reqUserId = RequestUtils.getUserIdToken(req, res);
    if (!reqUserId) return;

    const reqRole = RequestUtils.getRoleToken(req, res);
    if (!reqRole) return;

    try {
        let userId: number | undefined = undefined;

        // // ✅ ถ้าเป็น REQUESTER → filter ตาม user_id
        // if (reqRole === 'REQUESTER') {
        //     userId = reqUserId;
        // }

         // ✅ REQUESTER และ STORE → filter ตาม user_id
        if (reqRole === 'REQUESTER' || reqRole === 'STORE') {
            userId = reqUserId;
        }

        // role อื่น → userId = undefined (ดึงทั้งหมด)
        const response = await counterService.getOrderAllByUser(userId);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(
            res,
            operation,
            error.message,
            'item.counter',
            true,
            reqUsername
        );
    }
};


//role เป็น REQUESTER ให้ ดึง counter ตาม user_id / แต่ถ้า เป็น role อื่นๆ ให้ดึงทุก counter
export const getCounterAllByUser = async (req: Request, res: Response) => {
    const operation = 'counterController.getCounterAllByUser';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const reqUserId = RequestUtils.getUserIdToken(req, res);
    if (!reqUserId) return;

    const reqRole = RequestUtils.getRoleToken(req, res);
    if (!reqRole) return;

    try {
        let userId: number | undefined = undefined;

        // // ✅ ถ้าเป็น REQUESTER → filter ตาม user_id
        // if (reqRole === 'REQUESTER') {
        //     userId = reqUserId;
        // }

         // ✅ REQUESTER และ STORE → filter ตาม user_id
        if (reqRole === 'REQUESTER' || reqRole === 'STORE') {
            userId = reqUserId;
        }

        // role อื่น → userId = undefined (ดึงทั้งหมด)
        const response = await counterService.getCounterAllByUser(userId);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(
            res,
            operation,
            error.message,
            'item.counter',
            true,
            reqUsername
        );
    }
};

export const getByCounterId = async (req: Request, res: Response) => {
    const operation = 'checkoutController.getByCounterId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const counterIdParam = req.query.counterId || req.params.counterId;
    const counterId = Number(counterIdParam);

    if (isNaN(counterId)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await counterService.getByCounterId(counterId);

        // ✅ จุดสำคัญ: แปลง item_img → item_img_url
        if (response.isCompleted && response.data) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;

            response.data = response.data.map((item: any) => ({
                ...item,
                item_img_url: item.item_img
                ? `${baseUrl}/api/images/getImageUpload/stock_items_image/${item.item_id}/${item.item_img}`
                : null,
            }));
        }

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(
            res,
            operation,
            error.message,
            'counter',
            true,
            reqUsername
        );
    }
};

export const getByCounterIdPublic = async (req: Request, res: Response) => {
    const operation = "checkoutController.getByCounterIdPublic";

    const counterIdParam = req.params.counterId;
    const counterId = Number(counterIdParam);

    if (isNaN(counterId)) {
        return ResponseUtils.handleBadRequest(res, "Invalid counterId");
    }

    try {
        const response = await counterService.getByCounterId(counterId);

        // ✅ map image url เหมือนเดิม
        if (response.isCompleted && response.data) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        response.data = response.data.map((item: any) => ({
            ...item,
            item_img_url: item.item_img
            ? `${baseUrl}/api/images/getImageUpload/stock_items_image/${item.item_id}/${item.item_img}`
            : null,
        }));
        }

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        return res.status(500).json({
        isCompleted: false,
        message: "Internal server error",
        });
    }
};


