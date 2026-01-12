import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { LocationService } from '../services/locations.service';

dotenv.config();

const locationService = new LocationService();

export const searchLocations = async (req: Request, res: Response) => {
    const operation = 'StockItemController.searchLocations';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { loc, box_loc } = req.query;

    try {
        const response = await locationService.searchLocations(
            loc as string,
            box_loc as string,
        );
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.location', true, reqUsername);
    }
};