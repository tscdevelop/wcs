import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper';
import RequestUtils from '../utils/RequestUtils';

import { ImportService } from '../services/import_execel.service';

const importService = new ImportService();

export const createUsageJson = async (req: Request, res: Response) => {
    const operation = 'ImportController.createUsageJson';

    // ✅ ใช้ username เหมือน controller อื่น
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
        return ResponseUtils.handleBadRequest(res, 'No data provided');
        }

        const requestData = Array.isArray(req.body) ? req.body : [req.body];

        const response = await importService.createUsageJson(requestData, reqUsername);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(
        res,
        operation,
        error.message,
        'importing excel',
        true,
        reqUsername
        );
    }
};

export const createReceiptJson = async (req: Request, res: Response) => {
    const operation = 'ImportController.createReceiptJson';

    // ✅ ใช้ username เหมือน controller อื่น
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
        return ResponseUtils.handleBadRequest(res, 'No data provided');
        }

        const requestData = Array.isArray(req.body) ? req.body : [req.body];

        const response = await importService.createReceiptJson(requestData, reqUsername);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(
        res,
        operation,
        error.message,
        'importing excel',
        true,
        reqUsername
        );
    }
};
