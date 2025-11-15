import { Repository, EntityManager, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { StockItems } from '../entities/m_stock_items.entity';
import { handleFileUploads, UploadDirKey } from '../utils/filemanager';

const ItemFileMapping = {
    files: { filename: 'item_img', url: 'item_img_url', by: 'update_by' },
};

export class StockItemService {
    private itemsRepository: Repository<StockItems>;

    constructor(){
        this.itemsRepository = AppDataSource.getRepository(StockItems);
    }

    async create(data: Partial<StockItems>, files: { [key: string]: Express.Multer.File[] }, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<StockItems>();
        let itemData = new StockItems();
        const operation = 'StockItemService.create';

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

            const repository = useManager.getRepository(StockItems);

            if (validate.isNullOrEmpty(data.stock_item)) {
                return response.setIncomplete(lang.msgRequired('item.stock_item'));
            }
            if (validate.isNullOrEmpty(data.item_name)) {
                return response.setIncomplete(lang.msgRequired('item.item_name'));
            }

            // assign ข้อมูลเข้าไปใน itemData
            Object.assign(itemData, data);
            itemData.is_active = data.is_active ?? true,
            itemData.requested_at = new Date();
            itemData.requested_by = reqUsername;

            // ลบฟิลด์ที่เกี่ยวข้องกับการอัปโหลดไฟล์ออก
            delete data.item_img;
            delete data.item_img_url;

            // สร้าง hospital ขึ้นมา
            const hospital = repository.create(itemData);

            // บันทึก hospital ลงในฐานข้อมูล
            const savedData = await repository.save(hospital);

            // Handle file uploads ถ้ามีไฟล์
            if (files && savedData && savedData.item_id) {
                const subfolder = savedData.item_id.toString();
                console.log('subfolder:', subfolder);

                const updateUploadData = await handleFileUploads(files, subfolder, UploadDirKey.DIR_UPLOAD_ITEMS_IMAGE, reqUsername, ItemFileMapping);
                console.log('updateUploadData:', updateUploadData);

                if (Object.keys(updateUploadData).length > 0) {
                    const updateUploadResponse = await this.updateUploadfile(savedData.item_id, updateUploadData, useManager);
                    if (!updateUploadResponse.isCompleted) {
                        throw new Error(updateUploadResponse.message);
                    }
                    console.log('updateUploadResponse:', updateUploadResponse);
                }
            }

             // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('created', 'stock items data'), savedData);

        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async update(
        item_id: string,
        data: Partial<StockItems>,
        files: { [key: string]: Express.Multer.File[] },
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<StockItems>> {
        const response = new ApiResponse<StockItems>();
        const operation = 'StockItemService.update';

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
            const repository = useManager.getRepository(StockItems);
            
            // หา record เดิมก่อน
            const existingData = await repository.findOne({ where: { item_id } });
            if (!existingData) {
                return response.setIncomplete(lang.msgNotFound('items.items'));
            }

            if (validate.isNullOrEmpty(data.stock_item)) {
                return response.setIncomplete(lang.msgRequired('item.stock_item'));
            }
            if (validate.isNullOrEmpty(data.item_name)) {
                return response.setIncomplete(lang.msgRequired('item.item_name'));
            }

            data.requested_at = new Date();
            data.requested_by = reqUsername,

            // ลบฟิลด์ item_img และ item_img_url เพื่ออัปเดตในภายหลัง
            delete data.item_img;
            delete data.item_img_url;
        
            // อัปเดตข้อมูลโรงพยาบาล
            await repository.update({ item_id: item_id }, data);
        
            // ตรวจสอบว่ามีไฟล์ที่ต้องอัปโหลดหรือไม่
            if (files && Object.keys(files).length > 0) {
                const subfolder = item_id.toString();
                const updateUploadData = await handleFileUploads(
                    files,
                    subfolder,
                    UploadDirKey.DIR_UPLOAD_ITEMS_IMAGE,
                    reqUsername,
                    ItemFileMapping
                );
        
                if (Object.keys(updateUploadData).length > 0) {
                    const updateUploadResponse = await this.updateUploadfile(item_id, updateUploadData, useManager);
                    if (!updateUploadResponse.isCompleted) {
                        throw new Error(updateUploadResponse.message);
                    }
                    console.log('updateUploadResponse:', updateUploadResponse);
                }
            }
            
            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('updated', 'stock items data'), data);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async updateUploadfile(item_id: string, data: Partial<StockItems>, manager?: EntityManager): Promise<ApiResponse<StockItems>> {
        let response = new ApiResponse<StockItems>();
        const operation = 'StockItemService.updateUploadfile'; // Define operation

        try {
            const useManager = manager || AppDataSource.manager;
            await useManager.transaction(async (transactionManager) => {
                const repository = transactionManager.getRepository(StockItems);

                // ตรวจสอบว่า ID มีอยู่จริง
                const existingItem = await repository.findOne({ where: { item_id } });
                //console.log('Existing item:', existingItem); // Log ข้อมูลเดิม
                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound('item.outbtlitm'));
                }

                // อัปเดตข้อมูลไฟล์
                const updatedData = await repository.save({ item_id, ...data });
                //console.log('Updated Data:', updatedData); // Log ข้อมูลหลังอัปเดต

                // สร้าง response
                response = response.setComplete(
                    lang.msgSuccessAction('updated', 'stock items data'),
                    updatedData
                );
            });

            return response;

        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async delete( item_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'StockItemService.delete';

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
            const repository = useManager.getRepository(StockItems);
           // ตรวจสอบว่ามี item_id ปัจจุบันอยู่ในระบบหรือไม่
            const existing = await repository.findOne({ where: { item_id: item_id } });
            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('items.item_id'));
            }

            // ลบ entity โดยตรง
            await repository.remove(existing); // ✅ remove จะใช้ instance ของ entity

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('deleted', 'stock items data'));
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'StockItemService.getAll';

        try {
            const repository = manager ? manager.getRepository(StockItems) : this.itemsRepository;

            // Query ข้อมูลทั้งหมด
            const rawData = await repository.createQueryBuilder('items')
                .select([
                    'items.item_id AS item_id',
                    'items.stock_item AS stock_item',
                    'items.item_name AS item_name',
                    'items.item_desc AS item_desc',
                    'items.item_img AS item_img',
                    'items.item_img_url AS item_img_url',
                    "DATE_FORMAT(items.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                    // ✅ ใช้ CASE WHEN เพื่อแปลงค่า is_active
                    "CASE WHEN items.is_active = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS is_active"
                ])
                .orderBy('items.stock_item', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('stock items data'));
            }

            return response.setComplete(lang.msgFound('stock items data'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(item_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
            const response = new ApiResponse<any | null>();
            const operation = 'StockItemService.getById';
    
            try {
                const repository = manager ? manager.getRepository(StockItems) : this.itemsRepository;
        
                const itemIdStr = String(item_id); // แปลงเป็น string

                // Query item ข้อมูลทั้งหมดในรูปแบบ raw data
                const rawData = await repository.createQueryBuilder('items')
                    .select([
                        'items.item_id AS item_id',
                        'items.stock_item AS stock_item',
                        'items.item_name AS item_name',
                        'items.item_desc AS item_desc',
                        'items.item_img AS item_img',
                        'items.item_img_url AS item_img_url',
                        "DATE_FORMAT(items.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                    ])
                    .where('items.is_active = :isActive', { isActive: true })
                    .andWhere('items.item_id = :item_id', { item_id: itemIdStr })
                    .getRawOne();
    
                // หากไม่พบข้อมูล
                if (!rawData || rawData.length === 0) {
                    return response.setIncomplete(lang.msgNotFound('item.item_id'));
                }
    
                // ส่งข้อมูลกลับในรูปแบบ response
                return response.setComplete(lang.msgFound('item.item_id'), rawData);
            } catch (error: any) {
                console.error(`Error during ${operation}:`, error.message);
                if (error instanceof QueryFailedError) {
                    return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
                }
        
                throw new Error(lang.msgErrorFunction(operation, error.message));
            }
        }
}