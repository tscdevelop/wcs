import { Request, Response } from 'express';
import { LogService } from '../services/log.service';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import { ApiResponse } from '../models/api-response.model';

const logService = new LogService();

const safeValue = (value: any, defaultValue: any = null): any => {
    return value === undefined || value === null || value === "" ? defaultValue : value;
};

const safeNumber = (value: any): number | null => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};

