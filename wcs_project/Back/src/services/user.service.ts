import { Like, Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { s_user } from '../entities/s_user.entity';
import { ApiResponse } from '../models/api-response.model';
import CryptHelper from '../utils/CryptHelper';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import * as validate from '../utils/ValidationUtils'; // Import all validation functions
import { UserModel } from '../models/user.model';
import { s_role } from '../entities/s_role.entity';
import { RoleService } from './role.service';

export class UserService {
    // private userRepository: Repository<s_user>;
    // roleRepository: any;
    // roleService: any;
    private userRepository: Repository<s_user>;
    private roleService: RoleService; // กำหนด RoleService

    constructor() {
        this.userRepository = AppDataSource.getRepository(s_user);
        this.roleService = new RoleService();
    }

    /**
     * ตรวจสอบและยืนยันผู้ใช้
     * @param username ชื่อผู้ใช้
     * @param password รหัสผ่าน
     * @returns ApiResponse ที่มีข้อมูลผู้ใช้หรือข้อความแสดงข้อผิดพลาด
     */
    async validate(username: string, password: string): Promise<ApiResponse<s_user>> {
        let response = new ApiResponse<s_user>();
        const operation = 'UserService.validate';
        try {
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(username)) {
                response.setIncomplete(lang.msgRequired('field.username'));
            }
            if (validate.isNullOrEmpty(password)) {
                response.setIncomplete(lang.msgRequired('field.password'));
            }
            // ตรวจสอบว่ามี user ในระบบ หรือไม่
            const user = await this.userRepository.findOne({ where: { username, is_active: true } });
            // ตรวจสอบ ว่า password ตรงกันไหม
            if (user && await CryptHelper.comparePassword(password, user.password)) {
                response.message = lang.msgSuccessfulFormat('item.login'); 
                response.data = user;
                response.isCompleted = true;
            } else {
                response.message = lang.msg('validation.invalid_credentials');
                response.isCompleted = false;
            }
            return response;
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    /**
     * สร้างผู้ใช้ใหม่
     * @param data ข้อมูลผู้ใช้
     * @returns ApiResponse ที่มีข้อมูลผู้ใช้ใหม่หรือข้อความแสดงข้อผิดพลาด
     */

    //ของเดิม ก่อนแก้ความสัมพันธ์
    // async create(data: Partial<s_user>, manager?: EntityManager): Promise<ApiResponse<s_user>> {
    //     let response = new ApiResponse<s_user>();
    //     const operation = 'UserService.create';
    //     try {
    //         // ตรวจสอบข้อมูลที่จำเป็น
    //         if (validate.isNullOrEmpty(data.username)) {
    //             return response.setIncomplete(lang.msgRequired('field.username'));
    //         }
    //         // ตรวจสอบว่า username ซ้ำหรือไม่
    //         if (await this.checkUsernameExists(data.username!)) {
    //             return response.setIncomplete(lang.msgAlreadyExists('field.username'));
    //         }
    //         if (validate.isNullOrEmpty(data.password)) {
    //             return response.setIncomplete(lang.msgRequired('field.password'));
    //         }
    //         if (validate.isNullOrEmpty(data.role_code)) {
    //             return response.setIncomplete(lang.msgRequired('field.role'));
    //         }
    //         if (validate.isNullOrEmpty(data.create_by)) {
    //             return response.setIncomplete(lang.msgRequiredCreateby());
    //         }

    //         // เข้ารหัสรหัสผ่าน
    //         data.password = await CryptHelper.hashPassword(data.password);
    //         // กำหนดวันที่บันทึก
    //         data.create_date = new Date();

    //         // Using the provided manager or default repository
    //         const repository = manager ? manager.getRepository(s_user) : this.userRepository;

    //         // บันทึกข้อมูลผู้ใช้ใหม่
    //         const user = repository.create(data);
    //         const savedData = await repository.save(user);
    //         console.log('savedData : ',savedData);
    //         // Fetch the latest data after save
    //         const updatedResponse = await this.getByUserId(savedData.user_id, manager);
    //         if (!updatedResponse.isCompleted) {
    //             return response.setIncomplete(updatedResponse.message);
    //         }

    //         return response.setComplete(lang.msgSuccessAction('created', 'item.user'), updatedResponse.data!);

    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     }
    // }


    // V.2
    // async create(
    //     data: Partial<s_user>, 
    //     manager?: EntityManager
    // ): Promise<ApiResponse<s_user>> {
    //     let response = new ApiResponse<s_user>();
    //     let userData = new s_user();
    //     const operation = 'UserService.create';
    
    //     // ใช้ QueryRunner ถ้าไม่ได้ส่ง manager เข้ามา
    //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
    //     const useManager = manager || queryRunner?.manager;
    
    //     if (!useManager) {
    //         return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
    //     }
    
    //     // เริ่ม transaction ถ้าไม่ได้ส่ง manager เข้ามา
    //     if (!manager && queryRunner) {
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();
    //     }
    
    //     try {
    //         const repository = useManager.getRepository(s_user);
    
    //         // ตรวจสอบว่า role_code มีอยู่ใน s_role หรือไม่
    //         const roleRepository = useManager.getRepository(s_role);
    //         const role = await roleRepository.findOne({ where: { role_code: data.role_code } });
    //         if (!role) {
    //             return response.setIncomplete(lang.msgNotFound('item.role'));
    //         }
    
    //         // Validate required data
    //         if (validate.isNullOrEmpty(data.username)) {
    //             return response.setIncomplete(lang.msgRequired('field.username'));
    //         }
    //         if (validate.isNullOrEmpty(data.password)) {
    //             return response.setIncomplete(lang.msgRequired('field.password'));
    //         }
    
    //         // ตรวจสอบว่า username ซ้ำหรือไม่
    //         const existingUser = await repository.findOne({ where: { username: data.username } });
    //         if (existingUser) {
    //             return response.setIncomplete(lang.msgAlreadyExists('field.username'));
    //         }
    
    //         // เข้ารหัสรหัสผ่าน
    //         data.password = await CryptHelper.hashPassword(data.password);
    
    //         // assign ข้อมูลเข้าไปใน user
    //         Object.assign(userData, data);
    //         userData.create_date = new Date();
    //         userData.role_code = role.role_code; // เชื่อมโยง role_code
    
    //         // สร้าง user ใหม่
    //         const user = repository.create(userData);
    //         const savedUser = await repository.save(user);
    
    //         // ดึงข้อมูล user ที่สร้างใหม่
    //         const dataResponse = await this.getByUserId(savedUser.user_id!, useManager);
    //         if (!dataResponse.isCompleted) {
    //             throw new Error(dataResponse.message);
    //         }
    
    //         // ตั้งค่า response สำเร็จ
    //         response = response.setComplete(lang.msgSuccessAction('created', 'item.user'), dataResponse.data!);
    
    //         // คอมมิต transaction ถ้าไม่ได้ส่ง manager เข้ามา
    //         if (!manager && queryRunner) {
    //             await queryRunner.commitTransaction();
    //         }
    
    //         return response;
    
    //     } catch (error: any) {
    //         // ย้อนกลับ transaction ถ้ามีข้อผิดพลาด
    //         if (!manager && queryRunner) {
    //             await queryRunner.rollbackTransaction();
    //         }
    //         console.error('Error during user creation:', error);
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    
    //     } finally {
    //         // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
    //         if (!manager && queryRunner) {
    //             await queryRunner.release();
    //         }
    //     }
    // }


    async create(
        data: Partial<s_user>, 
        manager?: EntityManager
    ): Promise<ApiResponse<s_user>> {
        console.log('Service create called with data:', data);
        let response = new ApiResponse<s_user>();
        let userData = new s_user();
        const operation = 'UserService.create';

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
            const repository = useManager.getRepository(s_user);

            // ตรวจสอบว่า role_code ถูกต้องหรือไม่ผ่าน RoleService
            if (validate.isNullOrEmpty(data.role_code)) {
                return response.setIncomplete(lang.msgRequired('field.role'));
            } else {
                const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
                if (!roleExists) {
                    return response.setIncomplete(lang.msgNotFound('item.role'));
                }
            }

            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.username)) {
                return response.setIncomplete(lang.msgRequired('field.username'));
            }
            console.log('Username before validation:', data.username);

            if (validate.isNullOrEmpty(data.password)) {
                return response.setIncomplete(lang.msgRequired('field.password'));
            }

            // ตรวจสอบว่า username ซ้ำหรือไม่
            const existingUser = await repository.findOne({ where: { username: data.username } });
            if (existingUser) {
                return response.setIncomplete(lang.msgAlreadyExists('field.username'));
            }

            // เข้ารหัสรหัสผ่าน
            data.password = await CryptHelper.hashPassword(data.password);
            console.log('Sanitized data:', data);

            // assign ข้อมูลเข้าไปใน user
            Object.assign(userData, data);
            userData.create_date = new Date();
            userData.role_code = data.role_code!;  // กำหนด role_code ที่ได้รับการยืนยันว่ามีอยู่แล้ว

            // สร้าง user ใหม่
            const user = repository.create(userData);
            const savedUser = await repository.save(user);

            // ดึงข้อมูล user ที่สร้างใหม่
            const dataResponse = await this.getByUserId(savedUser.user_id!, useManager);
            if (!dataResponse.isCompleted) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('created', 'item.user'), dataResponse.data!);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during user creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));

        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
/**
   * แก้ไขข้อมูลผู้ใช้
   * @param user_id รหัสผู้ใช้
   * @param data ข้อมูลผู้ใช้ที่ต้องการแก้ไข
   * @returns ApiResponse ที่มีข้อความแสดงสถานะการแก้ไขข้อมูล
   */

    //ของเดิม
    // async edit(user_id: number, data: Partial<s_user>, manager?: EntityManager): Promise<ApiResponse<void>> {
    //     let response = new ApiResponse<any>();
    //     const operation = 'UserService.edit';
    //     console.log('operation : ',operation);
    //     try {
    //          // ตรวจสอบข้อมูลที่จำเป็น
    //          if (validate.isNullOrEmpty(user_id)) {
    //             return response.setIncomplete(lang.msgRequired('field.user_id'));
    //         }
    //         // ค้นหาผู้ใช้จาก user_id
    //         const user = await this.userRepository.findOne({ where: { user_id: user_id } });
    //         if (!user) {
    //             return response.setIncomplete(lang.msgNotFound('item.user'));
    //         }

    //         console.log('user.username : ',user.username);
    //         console.log('data.username : ',data.username);
    //         // ตรวจสอบข้อมูลที่จำเป็น
    //         if (data.username && data.username !== user.username) {
    //             console.log('checkUsernameExists');
    //             if (await this.checkUsernameExists(data.username)) {
    //             return response.setIncomplete(lang.msgAlreadyExists('field.username'));
    //             }
    //         }

    //         if (data.password) {
    //             data.password = await CryptHelper.hashPassword(data.password);
    //         }

    //         if (validate.isNullOrEmpty(data.role_code)) {
    //             return response.setIncomplete(lang.msgRequired('field.role'));
    //         }

    //         // กำหนดวันที่แก้ไข
    //         data.update_date = new Date();

    //         // Removing fields not to be updated if not provided
    //         const updateData: Partial<s_user> = {};
    //         if (data.username) updateData.username = data.username;
    //         if (data.password) updateData.password = data.password;
    //         if (data.role_code) updateData.role_code = data.role_code;
    //         if (data.is_active ) updateData.is_active = data.is_active;
    //         if (data.update_by) updateData.update_by = data.update_by;
    //         console.log('updateData : ',updateData);
    //         // Using the provided manager or default repository
    //         const repository = manager ? manager.getRepository(s_user) : this.userRepository;
    //         await repository.update(user_id, updateData);

    //         response.message = lang.msgSuccessAction('updated', 'item.user');
    //         response.isCompleted = true;
    //         // Fetch updated pet data
    //         const updatedResponse = await this.getByUserId(user_id, manager);
    //         if (updatedResponse.isCompleted && updatedResponse.data) {
    //             response.data = updatedResponse.data;
    //         }
    //         return response;

    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     }
    // }


    // v.2
    // async edit(user_id: number, data: Partial<s_user>, manager?: EntityManager): Promise<ApiResponse<void>> {
    //     let response = new ApiResponse<any>();
    //     const operation = 'UserService.edit';
    
    //     // ใช้ QueryRunner ถ้าไม่ได้ส่ง manager เข้ามา
    //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
    //     const useManager = manager || queryRunner?.manager;
    
    //     if (!useManager) {
    //         return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
    //     }
    
    //     // เริ่ม transaction ถ้าไม่ได้ส่ง manager เข้ามา
    //     if (!manager && queryRunner) {
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();
    //     }
    
    //     try {
    //         const repository = useManager.getRepository(s_user);
    
    //         // ตรวจสอบข้อมูลที่จำเป็น
    //         if (validate.isNullOrEmpty(user_id)) {
    //             return response.setIncomplete(lang.msgRequired('field.user_id'));
    //         }
    
    //         // ค้นหาผู้ใช้จาก user_id
    //         const user = await repository.findOne({ where: { user_id } });
    //         if (!user) {
    //             return response.setIncomplete(lang.msgNotFound('item.user'));
    //         }
    
    //         // ตรวจสอบว่าชื่อผู้ใช้ใหม่ซ้ำกับชื่อผู้ใช้อื่นหรือไม่
    //         if (data.username && data.username !== user.username) {
    //             if (await this.checkUsernameExists(data.username)) {
    //                 return response.setIncomplete(lang.msgAlreadyExists('field.username'));
    //             }
    //         }
    
    //         // ถ้ามีการเปลี่ยนรหัสผ่าน ให้เข้ารหัสใหม่
    //         if (data.password) {
    //             data.password = await CryptHelper.hashPassword(data.password);
    //         }
    
    //         // ตรวจสอบว่า role_code ถูกต้องหรือไม่
    //         if (validate.isNullOrEmpty(data.role_code)) {
    //             return response.setIncomplete(lang.msgRequired('field.role'));
    //         } else {
    //             // ตรวจสอบว่า role_code มีอยู่ใน s_role หรือไม่
    //             const roleRepository = useManager.getRepository(s_role);
    //             const role = await roleRepository.findOne({ where: { role_code: data.role_code } });
    //             if (!role) {
    //                 return response.setIncomplete(lang.msgNotFound('item.role'));
    //             }
    //         }
    
    //         // กำหนดวันที่แก้ไข
    //         data.update_date = new Date();
    
    //         // Removing fields not to be updated if not provided
    //         const updateData: Partial<s_user> = {};
    //         if (data.username) updateData.username = data.username;
    //         if (data.password) updateData.password = data.password;
    //         if (data.role_code) updateData.role_code = data.role_code;
    //         if (data.is_active !== undefined) updateData.is_active = data.is_active;
    //         if (data.update_by) updateData.update_by = data.update_by;
    
    //         // อัปเดตข้อมูล user
    //         await repository.update(user_id, updateData);
    
    //         response.message = lang.msgSuccessAction('updated', 'item.user');
    //         response.isCompleted = true;
    
    //         // Fetch updated user data
    //         const updatedResponse = await this.getByUserId(user_id, useManager);
    //         if (updatedResponse.isCompleted && updatedResponse.data) {
    //             response.data = updatedResponse.data;
    //         }
    
    //         // คอมมิต transaction ถ้าไม่ได้ส่ง manager เข้ามา
    //         if (!manager && queryRunner) {
    //             await queryRunner.commitTransaction();
    //         }
    
    //         return response;
    
    //     } catch (error: any) {
    //         // ย้อนกลับ transaction ถ้ามีข้อผิดพลาด
    //         if (!manager && queryRunner) {
    //             await queryRunner.rollbackTransaction();
    //         }
    //         console.error('Error during user update:', error);
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    
    //     } finally {
    //         // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
    //         if (!manager && queryRunner) {
    //             await queryRunner.release();
    //         }
    //     }
    // }

    async update(user_id: number, data: Partial<s_user>, manager?: EntityManager): Promise<ApiResponse<void>> {
        let response = new ApiResponse<any>();
        const operation = 'UserService.update';
    
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
            const repository = useManager.getRepository(s_user);
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(user_id)) {
                return response.setIncomplete(lang.msgRequired('field.user_id'));
            }
    
            // ค้นหาผู้ใช้จาก user_id
            const user = await repository.findOne({ where: { user_id } });
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('item.user'));
            }
    
            // ตรวจสอบว่า username ใหม่ซ้ำหรือไม่
            if (data.username && data.username !== user.username) {
                if (await this.checkUsernameExists(data.username)) {
                    return response.setIncomplete(lang.msgAlreadyExists('field.username'));
                }
            }
    
            // ตรวจสอบ role_code ด้วย RoleService
            if (validate.isNullOrEmpty(data.role_code)) {
                return response.setIncomplete(lang.msgRequired('field.role'));
            } else {
                const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
                if (!roleExists) {
                    return response.setIncomplete(lang.msgNotFound('item.role'));
                }
            }
    
            // เข้ารหัสรหัสผ่านหากมีการเปลี่ยนแปลง
            if (data.password) {
                data.password = await CryptHelper.hashPassword(data.password);
            }
    
            // กำหนดวันที่แก้ไข
            const updateData: Partial<s_user> = {
                username: data.username,
                password: data.password,
                role_code: data.role_code,
                is_active: data.is_active,
                update_by: data.update_by,
                update_date: new Date() // เพิ่มการตั้งค่าวันที่แก้ไขตรงนี้
            };
    
            await repository.update(user_id, updateData);
    
            response.message = lang.msgSuccessAction('updated', 'item.user');
            response.isCompleted = true;
    
            // ดึงข้อมูลที่แก้ไขมาใหม่
            const updatedResponse = await this.getByUserId(user_id, useManager);
            if (updatedResponse.isCompleted && updatedResponse.data) {
                response.data = updatedResponse.data;
            }
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response;
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during user update:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    
    // async update(user_id: number, data: Partial<s_user>, manager?: EntityManager): Promise<ApiResponse<void>> {
    //     let response = new ApiResponse<any>();
    //     const operation = 'UserService.update';

    //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
    //     const useManager = manager || queryRunner?.manager;

    //     if (!useManager) {
    //         return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
    //     }

    //     if (!manager && queryRunner) {
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();
    //     }

    //     try {
    //         const repository = useManager.getRepository(s_user);

    //         // ตรวจสอบข้อมูลที่จำเป็น
    //         if (validate.isNullOrEmpty(user_id)) {
    //             return response.setIncomplete(lang.msgRequired('field.user_id'));
    //         }

    //         // ค้นหาผู้ใช้จาก user_id
    //         const user = await repository.findOne({ where: { user_id } });
    //         if (!user) {
    //             return response.setIncomplete(lang.msgNotFound('item.user'));
    //         }

    //         // ตรวจสอบว่า username ใหม่ซ้ำหรือไม่
    //         if (data.username && data.username !== user.username) {
    //             if (await this.checkUsernameExists(data.username)) {
    //                 return response.setIncomplete(lang.msgAlreadyExists('field.username'));
    //             }
    //         }

    //         // ตรวจสอบ role_code ด้วย RoleService
    //         if (validate.isNullOrEmpty(data.role_code)) {
    //             return response.setIncomplete(lang.msgRequired('field.role'));
    //         } else {
    //             const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
    //             if (!roleExists) {
    //                 return response.setIncomplete(lang.msgNotFound('item.role'));
    //             }
    //         }

    //         // เข้ารหัสรหัสผ่านหากมีการเปลี่ยนแปลง
    //         if (data.password) {
    //             data.password = await CryptHelper.hashPassword(data.password);
    //         }

    //         // กำหนดวันที่แก้ไข
    //         data.update_date = new Date();

    //         // อัปเดตข้อมูล
    //         const updateData: Partial<s_user> = {
    //             username: data.username,
    //             password: data.password,
    //             role_code: data.role_code,
    //             is_active: data.is_active,
    //             update_by: data.update_by
    //         };

    //         await repository.update(user_id, updateData);

    //         response.message = lang.msgSuccessAction('updated', 'item.user');
    //         response.isCompleted = true;

    //         // ดึงข้อมูลที่แก้ไขมาใหม่
    //         const updatedResponse = await this.getByUserId(user_id, useManager);
    //         if (updatedResponse.isCompleted && updatedResponse.data) {
    //             response.data = updatedResponse.data;
    //         }

    //         if (!manager && queryRunner) {
    //             await queryRunner.commitTransaction();
    //         }

    //         return response;

    //     } catch (error: any) {
    //         if (!manager && queryRunner) {
    //             await queryRunner.rollbackTransaction();
    //         }
    //         console.error('Error during user update:', error);
    //         throw new Error(lang.msgErrorFunction(operation, error.message));

    //     } finally {
    //         if (!manager && queryRunner) {
    //             await queryRunner.release();
    //         }
    //     }
    // }

    /**
     * เปลี่ยนรหัสผ่านของผู้ใช้
     * @param user_id รหัสผู้ใช้
     * @param oldPassword รหัสผ่านเดิม
     * @param newPassword รหัสผ่านใหม่
     * @returns ApiResponse ที่มีข้อความแสดงสถานะการเปลี่ยนรหัสผ่าน
     */
    async changePassword(user_id: number, oldPassword: string, newPassword: string, update_by: string): Promise<ApiResponse<void>> {
        let response = new ApiResponse<void>();
        const operation = 'UserService.changePassword';
        try {
            // ค้นหาผู้ใช้
            const user = await this.userRepository.findOne({ where: { user_id, is_active: true } });
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('item.user')); 
            }
            if (validate.isNullOrEmpty(update_by)) {
                return response.setIncomplete(lang.msgRequiredUpdateby()); 
            }
            // ตรวจสอบรหัสผ่านเดิม
            const isPasswordValid = await CryptHelper.comparePassword(oldPassword, user.password);
            if (!isPasswordValid) {
                return response.setIncomplete(lang.msg('validation.invalid_old_password')); 
            }

            // เข้ารหัสรหัสผ่านใหม่
            const hashedNewPassword = await CryptHelper.hashPassword(newPassword);
            user.password = hashedNewPassword;
            user.update_date = new Date();
            user.update_by = update_by;

            // บันทึกรหัสผ่านใหม่
            
            await this.userRepository.save(user);

            return response.setComplete(lang.msgSuccessfulFormat('item.user_change_password'));
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));           
        }
    }

    /**
     * ลบผู้ใช้
     * @param user_id รหัสผู้ใช้
     * @returns ApiResponse ที่มีข้อความแสดงสถานะการลบผู้ใช้
     */
    async delete(user_id: number, manager?: EntityManager): Promise<ApiResponse<void>> {
        let response = new ApiResponse<void>();
        const operation = 'UserService.delete';
        try {
            const user =  await this.checkUserIDExists(user_id); //await this.userRepository.findOne({ where: { user_id } });
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('item.user')); 
            }

            // Using the provided manager or default repository
            const repository = manager ? manager.getRepository(s_user) : this.userRepository;
            await repository.delete(user_id);

            return response.setComplete(lang.msgSuccessAction('deleted','item.user'));
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));  
        }
    }

    /**
     * ค้นหาผู้ใช้โดยใช้ชื่อผู้ใช้
     * @param username ชื่อผู้ใช้
     * @param role_code บทบาทผู้ใช้
     * @returns ApiResponse ที่มีข้อมูลผู้ใช้หรือข้อความแสดงข้อผิดพลาด
     */
    async search(username?: string, role_code?: string): Promise<ApiResponse<s_user[]>> {
        const whereConditions: any = { is_active: true };
        let response = new ApiResponse<s_user[]>();
        const operation = 'UserService.search';
        try {
            if (username) {
                whereConditions.username = Like(`%${username}%`);
            }
            if (role_code) {
                whereConditions.role_code = Like(`%${role_code}%`);
            }

            const users = await this.userRepository.find({ where: whereConditions });

            if (users.length > 0) {
                response.message = lang.msgFound('item.user'); // msgFormat('message.found', [msg('item.user')]);
                response.data = users;
            } else {
                response.message = lang.msgNotFound('item.user'); //msgFormat('validation.no_users_found', [msg('item.user')]);
            }
            response.isCompleted = true;
            return response;
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message)); 
        }
    }

    //ของเดิม
    // async getByUserId(user_id: number,  manager?: EntityManager): Promise<ApiResponse<s_user | null>> {
    //     let response = new ApiResponse<s_user | null>();
    //     const operation = 'UserService.getByUserId';
    //     // Check if id is valid
    //     if (user_id <= 0 || isNaN(user_id)) {
    //         return response.setIncomplete(lang.msg('validation.invalid_parameter')); 
    //     }
    //     try {
    //         const repository = manager ? manager.getRepository(s_user) : this.userRepository;
    //         const user = await repository.createQueryBuilder('user')
    //             .leftJoinAndSelect('user.employee', 'employee')
    //             .leftJoinAndSelect('employee.hospital', 'hospital')
    //             .where('user.user_id = :user_id', { user_id })
    //             .getOne();

    //         if (!user) {
    //             return response.setIncomplete(lang.msgNotFound('item.user')); 
    //         }

    //         response = new ApiResponse<s_user | null>({
    //             message:  lang.msgFound('item.user'),//msgFormat('message.found', [msg('item.user')]),
    //             data: user,
    //             isCompleted: true
    //         });
    //         return response;
    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message)); 
    //     }
    // }


    async getByUserId(user_id: number, manager?: EntityManager): Promise<ApiResponse<s_user | null>> {
        let response = new ApiResponse<s_user | null>();
        const operation = 'UserService.getByUserId';
        
        // ตรวจสอบว่า user_id นั้นถูกต้องหรือไม่
        if (user_id <= 0 || isNaN(user_id)) {
            return response.setIncomplete(lang.msg('validation.invalid_parameter')); 
        }
        
        try {
            const repository = manager ? manager.getRepository(s_user) : this.userRepository;
    
            // ใช้ QueryBuilder ทำการ JOIN โดยอ้างถึง foreign key โดยตรง
            const user = await repository.createQueryBuilder('user')
                .leftJoinAndSelect('m_employee', 'employee', 'user.user_id  = employee.user_id ') // JOIN กับตาราง employee โดยตรง
                // .leftJoinAndSelect('m_hospital', 'hospital', 'employee.hospital_code = hospital.hospital_code') // JOIN กับตาราง hospital โดยตรง
                .where('user.user_id = :user_id', { user_id })
                .getOne();
    
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('item.user')); 
            }
    
            // ส่ง response กลับหากพบข้อมูล user
            response = new ApiResponse<s_user | null>({
                message: lang.msgFound('item.user'),
                data: user,
                isCompleted: true
            });
            return response;
    
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message)); 
        }
    }

    

     /**
     * ตรวจสอบไอดีผู้ใช้ว่ามีอยู่ในระบบหรือไม่
     * @param user_id ไอดีผู้ใช้งานระบบ
     * @returns ถ้าเจอ user จะคืนค่า true ถ้าไม่เจอจะคืนค่า false
     */
     async checkUserIDExists(user_id: number): Promise<boolean> {
        const count = await this.userRepository.count({ where: { user_id: user_id } });
        return count > 0; // ถ้าเจอ user จะคืนค่า true ถ้าไม่เจอจะคืนค่า false
    }

    /**
     * ตรวจสอบชื่อผู้ใช้ว่ามีอยู่ในระบบหรือไม่
     * @param username ชื่อผู้ใช้งานระบบ
     * @returns ถ้าเจอ user จะคืนค่า true ถ้าไม่เจอจะคืนค่า false
     */
    async checkUsernameExists(username: string): Promise<boolean> {
        const count = await this.userRepository.count({ where: { username: username } });
        return count > 0; // ถ้าเจอ user จะคืนค่า true ถ้าไม่เจอจะคืนค่า false
    }


}
