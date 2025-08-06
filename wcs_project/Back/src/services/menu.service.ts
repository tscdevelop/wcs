import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';
import { s_menu } from '../entities/s_menu.entity';
import { s_menu_action } from '../entities/s_menu_action.entity';
import { s_action } from '../entities/s_action.entity';
import { mapToMenuModel, MenuModel } from '../models/menu.model';

export class MenuService {
    private menuRepository: Repository<s_menu>;
    private menuActionRepository: Repository<s_menu_action>;
    private actionRepository: Repository<s_action>;

    constructor() {
        this.menuRepository = AppDataSource.getRepository(s_menu);
        this.menuActionRepository = AppDataSource.getRepository(s_menu_action);
        this.actionRepository = AppDataSource.getRepository(s_action);
    }

    async getMenuAll(): Promise<ApiResponse<MenuModel[]>> {
        let response = new ApiResponse<MenuModel[]>();
        const operation = 'MenuService.getMenuAll';

        try {
            
            // ดึงข้อมูล role และ permission ที่เกี่ยวข้อง
            const rawData = await this.menuRepository.createQueryBuilder('menu')
                .leftJoin('s_menu_action', 'menuact', 'menu.menu_id = menuact.menu_id')
                .leftJoin('s_action', 'act', 'menuact.action_code = act.action_code')
                .select([
                    'menu.menu_id as menu_id',
                    'menu.menu_seq as menu_seq',
                    'menu.menu_name as menu_name',
                    'menu.menu_name_desc as menu_name_desc',
                    'menu.parent_menu_id as parent_menu_id',
                    'menu.menu_is_active as menu_is_active',
                    'menuact.menuact_id as menuact_id',
                    'menuact.action_code as action_code',
                    'act.action_name as action_name',
                ])
                .where('menu.menu_is_active = 1')
                // .andWhere('menu.menu_id NOT BETWEEN 1 AND 12') // เพิ่มเงื่อนไขไม่แสดง menu_id ระหว่าง 1 ถึง 12
                .getRawMany();
    
                console.log('rawData : ', rawData);
            if (rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.menu'));
            }
    
            // ใช้ฟังก์ชัน mapping เพื่อแปลงข้อมูลเป็น Model
            const modelData = mapToMenuModel(rawData);
            console.log('modelData : ', modelData);
            return response.setComplete(lang.msgFound('item.menu'), modelData);    
    
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
}