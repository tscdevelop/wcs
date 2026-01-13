import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import { CounterService } from '../services/counter.service';
import * as lang from '../utils/LangHelper'; // ใช้ helper function

dotenv.config();

const counterService = new CounterService();

// export const getOrderAll = async (req: Request, res: Response) => {
//     const operation = 'checkoutController.getOrderAll';

//     const reqUsername = RequestUtils.getUsernameToken(req, res);
//     if (!reqUsername) return;

//     try {
//         // 🔹 รับค่าจาก query
//         const {
//             isExecution,
//             store_type,
//             mc_code,
//         } = req.query;

//         const response = await counterService.getOrderAll({
//             isExecution: isExecution === 'true',
//             store_type: store_type as string | undefined,
//             mc_code: mc_code as string | undefined,
//         });

//         return ResponseUtils.handleResponse(res, response);
//     } catch (error: any) {
//         console.error(`Error during ${operation}:`, error);
//         return ResponseUtils.handleErrorGet(
//             res,
//             operation,
//             error.message,
//             'item.counter',
//             true,
//             reqUsername
//         );
//     }
// };
export const getOrderAllByUser = async (req: Request, res: Response) => {
    const operation = 'counterController.getOrderAllByUser';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const reqUserId = RequestUtils.getUserIdToken(req, res);
    if (!reqUserId) return;

    try {
        // สมมติว่า userId เก็บไว้ใน token/reqUsername
        const userId = reqUserId; 
        const response = await counterService.getOrderAllByUser(userId);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.counter', true, reqUsername);
    }
};


export const getCounterAllByUser = async (req: Request, res: Response) => {
    const operation = 'counterController.getCounterAllByUser';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const reqUserId = RequestUtils.getUserIdToken(req, res);
    if (!reqUserId) return;

    try {
        // สมมติว่า userId เก็บไว้ใน token/reqUsername
        const userId = reqUserId; 
        const response = await counterService.getCounterAllByUser(userId);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.counter', true, reqUsername);
    }
};


export const getByCounterId = async (req: Request, res: Response) => {
    const operation = 'checkoutController.getByCounterId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    // 🔥 ดึง counterId จาก query หรือ params
    const counterIdParam = req.query.counterId || req.params.counterId;

    // แปลงเป็น number
    const counterId = Number(counterIdParam);
    if (isNaN(counterId)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียก service
        const response = await counterService.getByCounterId(counterId);
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

