import { Request, Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import { MRSService } from '../services/mrs.service';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';

import dotenv from 'dotenv';

dotenv.config();

const mrsService = new MRSService();

export const getAll = async (req: Request, res: Response) => {
    const operation = 'MRSController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await mrsService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.mrs', true, reqUsername);
    }
};