import { Repository } from 'typeorm';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import GLOBAL_SOFT_DELETE from '../config/GlobalConfig.json'; // ใช้ค่าจาก GlobalConfig.json

/**
 * จัดการลบข้อมูลแบบ `soft delete` หรือ `hard delete`
 * @param repository - ตัวจัดการฐานข้อมูล (TypeORM Repository)
 * @param entityId - ไอดีของข้อมูลที่ต้องการลบ
 * @param isSoftDelete - ถ้า `true` ใช้ soft delete, ถ้า `false` ใช้ hard delete
 * @param reqUsername - ผู้ที่ดำเนินการลบข้อมูล
 * @param softDeleteField - ชื่อฟิลด์ที่ใช้สำหรับ soft delete (default: `is_active`)
 * @returns ApiResponse<void> บอกสถานะการลบ
 */
export async function deleteEntity(
    repository: Repository<any>,
    entityId: number,
    reqUsername: string,
    softDeleteField: string = 'is_active',
    primaryKeyField: string = 'id'
): Promise<ApiResponse<void>> {
    const response = new ApiResponse<void>();

    console.log("GLOBAL_SOFT_DELETE:", GLOBAL_SOFT_DELETE.SOFT_DELETE);

    if (GLOBAL_SOFT_DELETE.SOFT_DELETE) {  
        // ค้นหา entity ก่อนทำ Soft Delete
        const entity = await repository.findOne({ where: { [primaryKeyField]: entityId } });

        // ถ้า `is_active` เป็น false อยู่แล้ว → แสดงว่าถูกลบไปแล้ว
        if (!entity || entity[softDeleteField] === false) {
            return response.setIncomplete(lang.msgDataNotFound() + ` ID: ${entityId}`);
        }

        // อัปเดต Soft Delete
        const updateResult = await repository.update(entityId, {
            [softDeleteField]: false,
            update_by: reqUsername,
            update_date: new Date()
        });

        if (updateResult.affected === 0) {
            return response.setIncomplete(lang.msgDataNotFound() + ` ID: ${entityId}`);
        }
    } else {  
        // ใช้ Hard Delete
        const deleteResult = await repository.delete({ [primaryKeyField]: entityId });

        if (deleteResult.affected === 0) {
            return response.setIncomplete(lang.msgDataNotFound() + ` ID: ${entityId}`);
        }
    }

    return response.setComplete(lang.msgSuccessAction('deleted', 'item.data'));
}


