import { Repository, EntityManager, QueryFailedError, Not } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { Locations } from '../entities/m_location.entity';

export class LocationService {
    private locRepository: Repository<Locations>;

    constructor(){
        this.locRepository = AppDataSource.getRepository(Locations);
    }
async searchLocations(
    loc?: string,
    box_loc?: string
): Promise<ApiResponse<any[]>> {
    const response = new ApiResponse<any[]>();
    const operation = 'LocationService.searchLocations';

    try {
        // 🔥 ป้องกันค่าว่าง "" (ให้กลายเป็น undefined)
        loc = loc?.trim() || undefined;
        box_loc = box_loc?.trim() || undefined;

        const query = this.locRepository.createQueryBuilder('location')
            .select([
                'location.loc_id AS loc_id',
                'location.loc AS loc',
                'location.box_loc AS box_loc',
            ]);

        if (validate.isNotNullOrEmpty(loc)) {
            query.andWhere('LOWER(location.loc) LIKE LOWER(:loc)', { loc: `%${loc}%` });
        }

        if (validate.isNotNullOrEmpty(box_loc)) {
            query.andWhere('LOWER(location.box_loc) LIKE LOWER(:box_loc)', { box_loc: `%${box_loc}%` });
        }

        const location = await query.getRawMany();

        if (!Array.isArray(location) || location.length === 0) {
            return response.setIncomplete(lang.msgNotFound('location'));
        }

        return response.setComplete(lang.msgFound('location'), location);

    } catch (error: any) {
        console.error(`Error in ${operation}:`, error);
        throw new Error(lang.msgErrorFunction(operation, error.message));
    }
}

    }