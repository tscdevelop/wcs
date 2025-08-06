import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { s_role } from '../entities/s_role.entity';
import { s_role_permis_action } from '../entities/s_role_permis_action.entity';
import { s_role_permis_menu } from '../entities/s_role_permis_menu.entity';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';
import { s_menu } from '../entities/s_menu.entity';
import { s_menu_action } from '../entities/s_menu_action.entity';
import { s_action } from '../entities/s_action.entity';
import {RoleModel, RoleCreateModel, RoleUpdateModel, mapToRoleModel}  from '../models/role.model';
import { DataSanitizer } from '../utils/DataSanitizer';
import { mapToRoleMenuModel , RoleMenuModel } from '../models/role_menu.model';
import { MenuRouteModel } from '../models/menu_route.model';
import { promises } from 'dns';
import { MenuActionModel } from '../models/menu_action.model';
import * as genum from '../common/global.enum';

export class RoleService {
    private roleRepository: Repository<s_role>;
    private rolePermisMenuRepository: Repository<s_role_permis_menu>;
    private rolePermisActionRepository: Repository<s_role_permis_action>;
    private menuRepository: Repository<s_menu>;
    private menuActionRepository: Repository<s_menu_action>

    constructor() {
        this.roleRepository = AppDataSource.getRepository(s_role);
        this.rolePermisMenuRepository = AppDataSource.getRepository(s_role_permis_menu);
        this.rolePermisActionRepository = AppDataSource.getRepository(s_role_permis_action);
        this.menuRepository = AppDataSource.getRepository(s_menu);
        this.menuActionRepository = AppDataSource.getRepository(s_menu_action);
    }

    async create(
        data: Partial<RoleCreateModel>,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<RoleModel>();
        const operation = 'RoleService.create';
    
        // เริ่มต้น Transaction
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
            const repository = manager ? useManager.getRepository(s_role) : this.roleRepository;
    
            // *** ตรวจสอบข้อมูล `permission_menus` ก่อน ***
            if (!Array.isArray(data.permission_menus) || data.permission_menus.length === 0) {
                throw new Error(lang.msgRequired('field.permission_menus'));
            }
    
             // ตรวจสอบว่า menu_id และ action_code มีความถูกต้อง
            for (const menu of data.permission_menus) {
                console.log("🔍 Checking menu existence:", menu.menu_id);
                const menuEntity = await useManager.getRepository(s_menu).findOne({ where: { menu_id: menu.menu_id } });
                if (!menuEntity) {
                    console.error(`❌ Menu ID ${menu.menu_id} not found!`);
                    throw new Error(lang.msgNotFound(`Menu ID ${menu.menu_id} not found`));
                }

                for (const actionCode of menu.permission_actions) {
                    const menuActionEntity = await useManager
                        .getRepository(s_menu_action)
                        .findOne({ where: { menu_id: menu.menu_id, action_code: actionCode } });
                    if (!menuActionEntity) {
                        throw new Error(
                            lang.msgErrorFormat(`Action Code ${actionCode} is not valid for Menu ID ${menu.menu_id}`)
                        );
                    }
                }
            }

            // ตรวจสอบข้อมูลอื่น ๆ
            if (validate.isNullOrEmpty(data.role_code)) {
                throw new Error(lang.msgRequired('field.role_code'));
            }
            if (await this.checkRoleCodeExists(data.role_code!)) {
                throw new Error(lang.msgAlreadyExists('field.role_code'));
            }
            if (validate.isNullOrEmpty(data.role_name)) {
                throw new Error(lang.msgRequired('field.role_name'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                throw new Error(lang.msgRequiredCreateby());
            }
    
            // *** บันทึก `role_code` ใน `s_role` ***
            console.log("📝 Creating Role:", data.role_code);
            const role = repository.create(data);
            const savedData = await repository.save(role);
            console.log("✅ Role Created:", savedData);
            
            // ✅ บันทึก permission_menus
            try {
                await this.savePermissions(savedData.role_code, data.permission_menus!, useManager);
            } catch (error) {
                await repository.delete({ role_code: savedData.role_code });
                throw new Error(lang.msgErrorFunction('savePermissions', (error as Error).message));
            }

            // ✅ กรอง permission_menus ที่มี action
            const filteredMenus = data.permission_menus.filter(menu => menu.permission_actions.length > 0);

            // ✅ ส่ง response กลับ
            response = response.setComplete(lang.msgSuccessAction('created', 'item.role'), {
                ...savedData,
                permission_menus: filteredMenus,
            });
    
            if (!manager && queryRunner) {
                console.log("🔄 Rolling back transaction...");
                try {
                    await queryRunner.rollbackTransaction();
                    console.log("⚠️ Transaction rolled back successfully!");
                } catch (err) {
                    console.error("❌ Error rolling back transaction:", err);
                }
            }
            
    
            return response;
    
        } catch (error: any) {
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during role creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }
    
    async update(
        role_code: string,
        data: Partial<RoleUpdateModel>,
        manager?: EntityManager // รับ parameter manager จากภายนอก
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<RoleModel>();
        const operation = 'RoleService.update';
    
        // ใช้ QueryRunner ถ้าไม่ได้ส่ง manager เข้ามา
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // ถ้าไม่ได้ส่ง manager เข้ามา ให้เริ่มต้น transaction
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(s_role) : this.roleRepository;
    
            // ตรวจสอบ role ที่ต้องการอัปเดต
            const existingRole = await repository.findOneBy({ role_code });
            if (!existingRole) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
    
            // *** ตรวจสอบข้อมูลทั้งหมด ***
            if (validate.isNullOrEmpty(data.update_by)) {
                throw new Error(lang.msgRequiredUpdateby());
            }
    
            if (validate.isNullOrEmpty(data.role_name)) {
                throw new Error(lang.msgRequired('field.role_name'));
            }
    
            if (data.permission_menus && data.permission_menus.length > 0) {
                for (const menu of data.permission_menus) {
                    // ตรวจสอบ menu_id
                    const menuEntity = await useManager.getRepository(s_menu).findOne({ where: { menu_id: menu.menu_id } });
                    if (!menuEntity) {
                        throw new Error(lang.msgNotFound(`Menu ID ${menu.menu_id} not found`));
                    }
    
                    // ตรวจสอบ action_code สำหรับ menu_id
                    for (const actionCode of menu.permission_actions) {
                        const menuActionEntity = await useManager
                            .getRepository(s_menu_action)
                            .findOne({ where: { menu_id: menu.menu_id, action_code: actionCode } });
                        if (!menuActionEntity) {
                            throw new Error(
                                lang.msgErrorFormat(`Action Code ${actionCode} is not valid for Menu ID ${menu.menu_id}`)
                            );
                        }
                    }
                }
            }
    
            console.log('Before existingRole : ', existingRole);
    
            // *** อัปเดตข้อมูล Role ***
            Object.assign(existingRole, data, {
                update_date: new Date(),
            });
    
            // บันทึกข้อมูล role ที่อัปเดตแล้ว
            await repository.save(existingRole);
    
            // ลบและสร้าง permissionMenus ใหม่
            await this.clearPermissions(role_code, useManager);
            await this.savePermissions(role_code, data.permission_menus!, useManager);
    
            // ดึงข้อมูล Role ที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getByRoleCode(role_code, useManager);
    
            if (!dataResponse.isCompleted) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.role'), dataResponse.data!);
    
            // คอมมิต transaction ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.commitTransaction();
            }
    
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // ย้อนกลับ transaction ถ้ามีข้อผิดพลาดเกิดขึ้นและไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during role edit:', errorMessage);
            throw new Error(lang.msgErrorFunction(operation, errorMessage));
        } finally {
            // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }
    
    async delete(role_code: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<void>();
        const operation = 'RoleService.delete';
    
        // สร้าง QueryRunner หากไม่ได้ส่ง manager เข้ามา
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่มต้น Transaction หากไม่ได้ส่ง manager เข้ามา
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {

            const repository =  manager ? useManager.getRepository(s_role): this.roleRepository;

            // ตรวจสอบว่า role_code นี้มีอยู่ในระบบหรือไม่
            const existingRole = await repository.findOneBy({ role_code });
            if (!existingRole) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }

            // ลบข้อมูล permission menus และ actions ที่เกี่ยวข้องกับ role
            await this.clearPermissions(role_code, useManager);

            // ลบข้อมูล role
            await repository.remove(existingRole);

            response.setComplete(lang.msgSuccessAction('deleted', 'item.role'));

            // คอมมิต Transaction หากไม่ได้ส่ง manager เข้ามา
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            // ย้อนกลับ transaction ถ้ามีข้อผิดพลาดเกิดขึ้นและไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during role deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async search(role_code?: string, name?: string): Promise<ApiResponse<s_role[]>> {
        let response = new ApiResponse<s_role[]>();
        const operation = 'RoleService.search';

        try {
            const query = this.roleRepository.createQueryBuilder('role');

            // ถ้ามี role_code ให้ค้นหาด้วย role_code
            if (validate.isNotNullOrEmpty(role_code)) {
                query.andWhere('role.role_code LIKE :role_code', { role_code: `%${role_code}%` });
            }

            // ถ้ามี name ให้ค้นหาด้วย name
            if (validate.isNotNullOrEmpty(name)) {
                query.andWhere('role.role_name LIKE :name', { name: `%${name}%` });
            }

            // ดึงข้อมูลที่ค้นหาได้
            const roles = await query.getMany();
            if (roles.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }

            return response.setComplete(lang.msgFound('item.role'), roles);

        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }


    private async savePermissions(
        role_code: string,
        permissionMenus: { menu_id: number; permission_actions: string[] }[],
        transactionManager: EntityManager
    ): Promise<void> {
    
        const operation = 'RoleService.savePermissions';
    
        try {
            console.log('permissionMenus : ', permissionMenus);
    
            // ดึงฟังก์ชัน getParentMenusRecursively มาใช้จาก service getMenuByPermission
            const getParentMenusRecursively = async (parentMenuIds: number[], menuRepository: Repository<s_menu>): Promise<any[]> => {
                if (parentMenuIds.length === 0) return [];
    
                const parentMenus = await menuRepository.createQueryBuilder('m')
                    .select([
                        'm.menu_id as menu_id',
                        'm.menu_name as menu_name',
                        'm.menu_route as menu_route',
                        'm.menu_key as menu_key',
                        'm.menu_component as menu_component',
                        'm.parent_menu_id as parent_menu_id'
                    ])
                    .where('m.menu_id IN (:...parentMenuIds)', { parentMenuIds })
                    .getRawMany();
    
                let nextParentMenuIds = parentMenus
                    .filter(item => item.parent_menu_id)
                    .map(item => item.parent_menu_id);
    
                nextParentMenuIds = [...new Set(nextParentMenuIds)];
    
                const nextParentMenus = await getParentMenusRecursively(nextParentMenuIds, menuRepository);
    
                return [...parentMenus, ...nextParentMenus];
            };
    
            // Set สำหรับเก็บเมนูที่บันทึกแล้ว เพื่อป้องกันการบันทึกซ้ำ
            const savedMenuIds = new Set<number>();
    
            if (permissionMenus && permissionMenus.length > 0) {
                for (const menu of permissionMenus) {
                    const menuEntity = await transactionManager.getRepository(s_menu).findOne({ where: { menu_id: menu.menu_id } });
                    if (!menuEntity) {
                        throw new Error(lang.msgDataNotFound());
                    }
    
                    // ดึง parent_menu_id ของเมนูที่กำหนด
                    const parentMenus = await getParentMenusRecursively([menu.menu_id], transactionManager.getRepository(s_menu));
                    const allMenus = [menuEntity, ...parentMenus];  // รวมเมนูหลักและ parent menus
    
                    // วนลูปเพื่อบันทึกทั้งเมนูหลักและ parent menus
                    for (const menuItem of allMenus) {
                        // ตรวจสอบว่าเมนูนี้ถูกบันทึกแล้วหรือยัง
                        if (!savedMenuIds.has(menuItem.menu_id)) {
                            const rolePermisMenu = new s_role_permis_menu();
                            rolePermisMenu.role_code = role_code;
                            rolePermisMenu.menu_id = menuItem.menu_id;
                            console.log('rolePermisMenu : ', rolePermisMenu);
                            await transactionManager.getRepository(s_role_permis_menu).save(rolePermisMenu);
    
                            // บันทึก menu_id ลงใน Set เพื่อป้องกันการบันทึกซ้ำ
                            savedMenuIds.add(menuItem.menu_id);
    
                            // บันทึก permission_actions ถ้าเป็นเมนูหลัก
                            if (menuItem.menu_id === menu.menu_id && menu.permission_actions.length > 0) {
                                for (const actionCode of menu.permission_actions) {
                                    const rolePermisAction = new s_role_permis_action();
    
                                    const actionEntity = await transactionManager.getRepository(s_action).findOne({ where: { action_code: actionCode } });
                                    if (!actionEntity) {
                                        throw new Error(lang.msgDataNotFound());
                                    }
    
                                    rolePermisAction.rpm_id = rolePermisMenu.rpm_id;
                                    rolePermisAction.action_code = actionEntity.action_code;
                                    console.log('rolePermisAction : ', rolePermisAction);
                                    await transactionManager.getRepository(s_role_permis_action).save(rolePermisAction);
                                }
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
        
    private async clearPermissions(role_code: string, manager: EntityManager): Promise<void> {
        const operation = 'RoleService.clearPermissions';

        try {
            // ลบ permission actions ที่เกี่ยวข้องกับ menus
            const permissionMenus = await manager.getRepository(s_role_permis_menu).find({ where: { role_code } });
            for (const menu of permissionMenus) {
                await manager.getRepository(s_role_permis_action).delete({ rpm_id: menu.rpm_id });
            }

            // ลบ permission menus
            await manager.getRepository(s_role_permis_menu).delete({ role_code });
        } catch (error: any) {
            console.error('Error during clearPermissions:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    /**
     * ตรวจสอบรหัสสิทธิ์การใช้งานว่ามีอยู่ในระบบหรือไม่
     * @param role_code รหัสสิทธิ์การใช้งาน
     * @returns ถ้ามีอยู่แล้ว จะคืนค่า true ถ้าไม่เจอจะคืนค่า false
     */
    async checkRoleCodeExists(role_code: string): Promise<boolean> {
        const count = await this.roleRepository.count({ where: { role_code: role_code } });
        return count > 0; 
    }
    // Service สำหรับตรวจสอบว่ามี role ที่ใช้ role_code นี้อยู่แล้วหรือไม่
    async codeExists(role_code: string): Promise<ApiResponse<boolean>> {
        let response = new ApiResponse<boolean>();
        const operation = 'RoleService.codeExists';

        try {
            const status = await this.checkRoleCodeExists(role_code);
            let message = "";
            if (status == true) {
                message = lang.msgAlreadyExists('field.role_code');
            }
            else{
                message = lang.msgNotFound('field.role_code');
            }

            return response.setComplete(message, status);

        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getByRoleCode(role_code: string, manager?: EntityManager): Promise<ApiResponse<RoleModel>> {
        let response = new ApiResponse<RoleModel>();
        const operation = 'RoleService.getByRoleCode';
    
        if (!role_code) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(s_role) : this.roleRepository;

            // ดึงข้อมูล role และ permission ที่เกี่ยวข้อง
            const rawData = await repository.createQueryBuilder('role')
                .leftJoin('s_role_permis_menu', 'rpm', 'role.role_code = rpm.role_code')
                .leftJoin('s_role_permis_action', 'rpa', 'rpm.rpm_id = rpa.rpm_id')
                .select([
                    'role.role_code as role_code',
                    'role.role_name as role_name',
                    'role.role_description as role_description',
                    'role.role_is_active as role_is_active',
                    'rpm.menu_id as menu_id',
                    'rpa.action_code as action_code'
                ])
                .where('role.role_code = :role_code', { role_code })
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
            
    
            // ใช้ฟังก์ชัน mapping เพื่อแปลงข้อมูลเป็น ViewModel
            const roleViewModel = mapToRoleModel(rawData);
            //let roleViewModel: Partial<RoleModel> = DataSanitizer.fromObject<RoleModel>(rawData, RoleModel);

            return response.setComplete(lang.msgFound('item.role'), roleViewModel);    
    
        } catch (error: any) {
            console.error('Error during getByRoleCode:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getPermissionByRole(role_code: string, manager?: EntityManager): Promise<ApiResponse<RoleMenuModel>> {
        let response = new ApiResponse<RoleMenuModel>();
        const operation = 'RoleService.getPermissionByRole';
    
        if (!role_code) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(s_role) : this.roleRepository;
    
            // Query ข้อมูลจากฐานข้อมูล
            const rawData = await repository.createQueryBuilder('role')
                .leftJoin('s_role_permis_menu', 'rpm', 'role.role_code = rpm.role_code')
                .leftJoin('s_role_permis_action', 'rpa', 'rpm.rpm_id = rpa.rpm_id')
                .leftJoin('s_menu', 'm', 'rpm.menu_id = m.menu_id')
                .leftJoin('s_action', 'a', 'rpa.action_code = a.action_code')
                .select([
                    'role.role_code as role_code',
                    'role.role_name as role_name',
                    'role.role_description as role_description',
                    'role.role_is_active as role_is_active',
                    'rpm.menu_id as menu_id',
                    'm.menu_name as menu_name',
                    'm.menu_seq as menu_seq',
                    'm.parent_menu_id as parent_menu_id',
                    'm.menu_is_active as menu_is_active',
                    'm.menu_route as menu_route',
                    'm.menu_key as menu_key',
                    'm.menu_icon as menu_icon',
                    'm.menu_component as menu_component',
                    'rpa.rpa_id as menuact_id',
                    'rpa.action_code as action_code',
                    'a.action_name as action_name'
                ])
                .where('role.role_code = :role_code', { role_code })
                .getRawMany();
    
            if (rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
    
            // เรียกใช้ฟังก์ชัน mapping เพื่อจัดรูปแบบข้อมูล
            const modelData = mapToRoleMenuModel(rawData);
            console.log('modelData : ', modelData);
            return response.setComplete(lang.msgFound('item.menu'), modelData);
    
        } catch (error: any) {
            console.error('Error during getPermissionByRole:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getParentMenusRecursively(parentMenuIds: number[], menuRepository: Repository<s_menu>): Promise<any[]> {
        if (parentMenuIds.length === 0) return []; // ถ้าไม่มี parent_menu_id ที่ต้องการดึงแล้ว ให้หยุดการทำงาน
    
        // ดึงข้อมูลเมนูพ่อแม่ที่ตรงกับ parentMenuIds
        const parentMenus = await menuRepository.createQueryBuilder('m')
            .select([
                'm.menu_id as menu_id',
                'm.menu_name as menu_name',
                'm.menu_route as menu_route',
                'm.menu_key as menu_key',
                'm.menu_component as menu_component',
                'm.parent_menu_id as parent_menu_id'
            ])
            .where('m.menu_id IN (:...parentMenuIds)', { parentMenuIds })
            .getRawMany();
    
        // ดึง parent_menu_id จากเมนูพ่อแม่ที่ได้มา (กรองเฉพาะที่มี parent_menu_id)
        let nextParentMenuIds = parentMenus
            .filter(item => item.parent_menu_id)  // กรองเฉพาะเมนูที่มี parent_menu_id
            .map(item => item.parent_menu_id);    // เก็บ parent_menu_id เพื่อใช้ดึงเมนูพ่อแม่ในรอบถัดไป
    
        // ลบค่าซ้ำใน nextParentMenuIds
        nextParentMenuIds = [...new Set(nextParentMenuIds)];
    
        // เรียกฟังก์ชันนี้อีกครั้ง (recursive) เพื่อดึงเมนูพ่อแม่ในระดับถัดไป
        const nextParentMenus = await this.getParentMenusRecursively(nextParentMenuIds, menuRepository);
    
        // รวมเมนูพ่อแม่ที่ดึงได้ในรอบนี้และรอบถัดไป
        return [...parentMenus, ...nextParentMenus];
    }

    // ปรับ การดึงเมนูให้ ให้ บันทึก parent menu ใน permission ด้วย
    async getMenuByPermission(role_code: string, manager?: EntityManager): Promise<ApiResponse<MenuRouteModel[]>> {
        let response = new ApiResponse<MenuRouteModel[]>();
        const operation = 'RoleService.getMenuByPermission';
    
        if (!role_code) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(s_role) : this.roleRepository;
    
            // Query ข้อมูลเมนูที่มีสิทธิ์ทั้งหมดจาก s_role_permis_menu และ s_menu
            const rawData: any[] = await repository.createQueryBuilder('role')
                .leftJoin('s_role_permis_menu', 'rpm', 'role.role_code = rpm.role_code')
                .leftJoin('s_menu', 'm', 'rpm.menu_id = m.menu_id')
                .select([
                    'm.menu_id as menu_id',
                    'm.parent_menu_id as parent_menu_id',
                    'm.menu_level as menu_level',
                    'm.menu_seq as menu_seq',
                    'm.menu_name as menu_name',
                    'm.menu_key as menu_key',
                    'm.menu_route as menu_route'
                ])
                .where('role.role_code = :role_code', { role_code }) // ตรวจสอบ alias ของ role
                .andWhere('m.menu_is_active = 1') // ตรวจสอบ alias ของ m
                .orderBy('m.menu_seq')
                .getRawMany();

    
            // console.log('Raw Data:', rawData); // Debug raw data
    
            if (rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
    
            // ฟังก์ชันสำหรับแปลงข้อมูลให้เป็น NewMenuRouteModel
            const finalMenus = this.mapToNewMenuRouteModel(rawData);
    
            // console.log('Final Menus:', finalMenus); // Debug final menus
    
            return response.setComplete(lang.msgFound('item.menu'), finalMenus);
        } catch (error: any) {
            console.error('Error during getMenuByPermission:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    // ฟังก์ชัน mapToNewMenuRouteModel สำหรับแปลงโครงสร้างข้อมูลให้เป็นรูปแบบใหม่
    private mapToNewMenuRouteModel(rawData: any[]): MenuRouteModel[] {
        const menuMap = new Map<number, MenuRouteModel>();
    
        // แปลงข้อมูลดิบให้เป็น MenuRouteModel แต่ละรายการ
        rawData.forEach(menu => {
            const menuItem: MenuRouteModel = {
                type: '',  // กำหนด type ภายหลัง
                key: menu.menu_key,
                name: menu.menu_name,
                menu_id: menu.menu_id.toString(),
                route: menu.menu_route || undefined,
                noCollapse: true,  // สมมติว่าไม่มีเมนูย่อย
                collapse: []
            };
            menuMap.set(menu.menu_id, menuItem);
            // console.log("Added menu item to menuMap:", menuItem); // ตรวจสอบการเพิ่มรายการใน map
        });
    
        // console.log("menuMap:", menuMap); // ตรวจสอบการเพิ่มรายการใน menuMap
        // สร้างโครงสร้างเมนูตาม parent_menu_id
        const menuTree: MenuRouteModel[] = [];
        // console.log("Initial menuTree:", menuTree); // ตรวจสอบค่าเริ่มต้นของ menuTree
    
        rawData.forEach(menu => {
            const parentMenuId = menu.parent_menu_id;
            const menuItem = menuMap.get(menu.menu_id);
            // console.log("Processing menu:", menu); // ตรวจสอบเมนูปัจจุบันที่กำลังประมวลผล
    
            if (!menuItem) {
                console.log("MenuItem not found, skipping:", menu.menu_id); // ถ้าไม่พบ menuItem
                return;
            }
    
            // ตรวจสอบว่าเป็นเมนูหลักหรือไม่ (parent_menu_id เป็น null หรือ 0)
            if (parentMenuId === null || parentMenuId === 0) {
                // ถ้าเป็นเมนูหลัก (ไม่มี parent)
                menuTree.push(menuItem);
                // console.log("Added to root menuTree:", menuItem); // ตรวจสอบการเพิ่มใน root tree
            } else {
                // ถ้าเป็นเมนูย่อย
                const parentMenu = menuMap.get(parentMenuId);
                if (parentMenu) {
                    parentMenu.type = 'collapse';
                    parentMenu.noCollapse = false;
    
                    // ตรวจสอบว่ามีค่า collapse หรือไม่ ถ้าไม่มี ให้กำหนดเป็น array เปล่า
                    if (!parentMenu.collapse) {
                        parentMenu.collapse = [];
                    }
    
                    parentMenu.collapse.push(menuItem);
                    // console.log("Added to parent collapse:", parentMenu); // ตรวจสอบการเพิ่มเข้าไปในเมนูย่อย
                } else {
                    console.log("Parent menu not found for menuId:", menu.menu_id); // ถ้าไม่พบ parent menu
                }
            }
        });
    
        // กำหนด type ให้กับเมนูที่เหลือ
        function setMenuType(menuList: MenuRouteModel[]) {
            // console.log("menuList:", menuList); // ตรวจสอบการเพิ่มรายการใน menuMap
            menuList.forEach(menu => {
                if (menu.collapse && menu.collapse.length > 0) {
                    menu.type = 'collapse';
                    setMenuType(menu.collapse);  // ใช้ฟังก์ชันซ้ำสำหรับเมนูย่อย
                } else {
                    menu.type = 'item';
                }
                // console.log("Menu type set:", menu); // ตรวจสอบการตั้งค่า type
            });
        }
    
        setMenuType(menuTree);
        // console.log("Final menuTree:", menuTree); // ตรวจสอบโครงสร้างสุดท้ายของ tree
        return menuTree;
    }
    
    async getPermissionAction(role_code: string, menu_id: number, manager?: EntityManager): Promise<ApiResponse<MenuActionModel>> {
        let response = new ApiResponse<MenuActionModel>();
        const operation = 'RoleService.getPermissionAction';

        if (!role_code || !menu_id) {
            return response.setIncomplete("Invalid parameters");
        }

        try {
            const repository = manager ? manager.getRepository(s_role) : this.roleRepository;

            const rawData = await repository.createQueryBuilder('role')
                .leftJoin('s_role_permis_menu', 'rpm', 'role.role_code = rpm.role_code')
                .leftJoin('s_role_permis_action', 'rpa', 'rpm.rpm_id = rpa.rpm_id')
                .leftJoin('s_menu_action', 'ma', 'ma.menu_id = rpm.menu_id')
                .select([
                    'ma.action_code AS action_code',  // ดึง action_code ทั้งหมด
                    'rpa.action_code AS permission_action_code'  // ดึง action_code ที่มีสิทธิ์
                ])
                .where('role.role_code = :role_code', { role_code })
                .andWhere('rpm.menu_id = :menu_id', { menu_id })
                .getRawMany();

            if (rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.menu'));
            }

            // ดึง action_code ทั้งหมดจาก s_menu_action
            const allActions = rawData.map(item => item.action_code);

            // ดึง action_code ที่มีสิทธิ์จาก s_role_permis_action
            const allowedActions = rawData
                .filter(item => item.permission_action_code !== null)  // ตรวจสอบเฉพาะ action ที่มีสิทธิ์
                .map(item => item.permission_action_code);

            // Loop 
            let permission_actions: Record<string, boolean> = {};
            for (const action of allActions) {
                permission_actions[action] = allowedActions.includes(action);
            }

            // สร้าง MenuActionModel และ Map ข้อมูลเข้าไป
            const actionModel = new MenuActionModel(role_code, menu_id, permission_actions);

            // ส่งผลลัพธ์กลับ
            return response.setComplete("Actions found", actionModel); // เปลี่ยนจาก [actionModel] เป็น actionModel
        } catch (error: any) {
            console.error('Error during getPermissionAction:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}
