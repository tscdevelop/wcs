// controllers/aisle.controller.ts
import { Request, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import { AisleService } from '../services/aisle.service';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import dotenv from 'dotenv';

import { MockMrsGateway } from '../gateways/mrs.gateway.mock';

dotenv.config();

// หรือใช้ mock สำหรับ testing
const mockGateway = new MockMrsGateway({
    onOpenFinished: (p) => console.log('OPEN finished', p),
    onCloseFinished: (p) => console.log('CLOSE finished', p),
});
const aisleService = new AisleService(mockGateway);

// ถ้า AisleService ของคุณไม่ต้องการ MrsGateway ให้ใช้แบบเดิม:
// const aisleService = new AisleService();

export const manualControl = async (req: Request, res: Response) => {
    const operation = 'AisleController.manualControl';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return; // handle ในตัว util แล้ว

    try {
        // รับค่าจาก path หรือ body (รองรับทั้งสองช่องทาง)
        const aisleIdParam = req.params.aisle_id;
        const { aisle_id: aisleIdBody, action: actionRaw, mrs_id: mrsIdRaw } = req.body || {};

        const aisle_id = String(aisleIdParam ?? aisleIdBody ?? '').trim();
        const action = String(actionRaw ?? '').trim().toUpperCase(); // "OPEN" | "CLOSE"
        const mrs_id = mrsIdRaw != null && mrsIdRaw !== '' ? String(mrsIdRaw) : undefined;

        // ----- Validate ขั้นต้น -----
        if (!aisle_id) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequired('aisle.aisle_id'));
        }
        if (!action || !['OPEN', 'CLOSE'].includes(action)) {
            return ResponseUtils.handleBadRequest(
                res,
                lang.msg('validation.enum_invalid', { field: 'action', allow: 'OPEN, CLOSE' })
            );
        }

        // เรียก service ด้วย DTO ที่ถูกต้อง
        const response = await aisleService.manualControl({ aisle_id, action: action as 'OPEN' | 'CLOSE', mrs_id }, reqUsername);

        // manual control = update state → 200 OK
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
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
