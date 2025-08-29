import { EntityManager, Not, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { Aisle } from "../entities/aisle.entity";
import { AisleStatus } from "../common/global.enum";

export class AisleService {
    private aisleRepository : Repository<Aisle>;

    constructor(){
        this.aisleRepository = AppDataSource.getRepository(Aisle);
    }

    async updateControl(
        data: Partial<Aisle>,
        reqUsername: string,
        manager?: EntityManager
        ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<Aisle>();
        const operation = 'AisleService.updateControl';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            const repository = useManager.getRepository(Aisle);

            // ----- Validate -----
            if (validate.isNullOrEmpty(data.aisle_id)) {
                return response.setIncomplete(lang.msgRequired('aisle.aisle_id'));
            }
            if (validate.isNullOrEmpty(data.status)) {
                return response.setIncomplete(lang.msgRequired('aisle.status'));
            }

            const existing = await repository.findOneBy({ aisle_id: data.aisle_id! });
            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('item.aisle'));
            }

            const validStatuses = Object.values(AisleStatus);
            if (!validStatuses.includes(data.status as AisleStatus)) {
                return response.setIncomplete(
                    lang.msg('validation.enum_invalid', {
                    field: 'status',
                    allow: validStatuses.join(', ')
                    })
                );
            }

            // อัปเดตเฉพาะฟิลด์ที่ตั้งใจจะเปลี่ยน
            repository.merge(existing, {
                status: data.status as AisleStatus,
                update_by: reqUsername,
                last_event_at: new Date(),
            });

            // บันทึก (เป็น update)
            const savedData = await repository.save(existing);

            // แนะนำ: ใช้ "updated" เพราะเป็นการอัปเดต ไม่ใช่สร้างใหม่
            response = response.setComplete(
                lang.msgSuccessAction('updated', 'item.aisle'),
                savedData
            );

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            return response;

        } catch (error: any) {
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during aisle control:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }


    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'AisleService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(Aisle) : this.aisleRepository;
    
            const rawData = await repository
                .createQueryBuilder('aisle')
                .select([
                    'aisle.aisle_id AS aisle_id',
                    'aisle.aisle_code AS aisle_code',
                    'aisle.bank_code AS bank_code',
                    'aisle.status AS status',
                    `DATE_FORMAT(aisle.last_opened_at, '%d/%m/%Y %H:%i:%s') AS last_opened_at`,
                    `DATE_FORMAT(aisle.last_closed_at, '%d/%m/%Y %H:%i:%s') AS last_closed_at`,
                    `DATE_FORMAT(aisle.last_event_at, '%d/%m/%Y %H:%i:%s') AS last_event_at`,
                ])
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.aisle'));
            }
    
            return response.setComplete(lang.msgFound('item.aisle'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}