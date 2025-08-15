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
            // แนะนำให้ trim จะได้ไม่พลาดช่องว่างหัวท้าย
            const uname = (username ?? '').trim();
            const pwd   = password ?? '';

            // ✅ ขาดฟิลด์ไหนให้ return ทันที
            if (validate.isNullOrEmpty(uname)) {
            return response.setIncomplete(lang.msgRequired('field.username'));
            }
            if (validate.isNullOrEmpty(pwd)) {
            return response.setIncomplete(lang.msgRequired('field.password'));
            }

            // หา user ที่ active
            const user = await this.userRepository.findOne({ where: { username: uname, is_active: true } });

            // ตรวจรหัสผ่าน
            if (user && await CryptHelper.comparePassword(pwd, user.password)) {
            response.message = lang.msgSuccessfulFormat('item.login');
            response.data = user;
            response.isCompleted = true;
            return response;
            }

            // ข้อมูลเข้าผิด
            response.message = lang.msg('validation.invalid_credentials');
            response.isCompleted = false;
            return response;

        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async create(
        data: Partial<s_user>,
        manager?: EntityManager
        ): Promise<ApiResponse<s_user>> {
        let response = new ApiResponse<s_user>();
        let userData = new s_user();
        const operation = 'UserService.create';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        try {
            const repository = useManager.getRepository(s_user);

            // ---------- Validation (ยังไม่เปิด transaction) ----------
            if (validate.isNullOrEmpty(data.role_code)) {
            return response.setIncomplete(lang.msgRequired('field.role'));
            } else {
            // **แนะนำ** ให้ RoleService ใช้ manager/connection เดียวกัน (ส่ง useManager เข้าไปถ้ารองรับ)
            const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
            if (!roleExists) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
            }

            if (validate.isNullOrEmpty(data.username)) {
            return response.setIncomplete(lang.msgRequired('field.username'));
            }
            if (validate.isNullOrEmpty(data.password)) {
            return response.setIncomplete(lang.msgRequired('field.password'));
            }
            if (validate.isNullOrEmpty(data.user_first_name)) {
            return response.setIncomplete(lang.msgRequired('field.first_name'));
            }

            // ป้องกัน whitespace ทำให้ซ้ำโดยไม่ตั้งใจ
            data.username = data.username!.trim();

            // ตรวจสอบ username ซ้ำ
            const existingUser = await repository.findOne({ where: { username: data.username } });
            if (existingUser) {
            return response.setIncomplete(lang.msgAlreadyExists('field.username'));
            }

            // ---------- เปิด transaction ช่วงที่จะเขียนจริง ----------
            if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            }

            // เข้ารหัสรหัสผ่าน
            data.password = await CryptHelper.hashPassword(data.password!);
            console.log('Sanitized data:', data);

            // assign ข้อมูลเข้าไปใน user model
            Object.assign(userData, data);
            userData.create_date = new Date();
            userData.role_code = data.role_code!;

            // บันทึก
            const user = repository.create(userData);
            const savedUser = await repository.save(user);

            // ดึงข้อมูล user ที่เพิ่งสร้าง (ใช้ manager เดิม)
            const dataResponse = await this.getByUserId(savedUser.user_id!, useManager);
            if (!dataResponse.isCompleted) {
            throw new Error(dataResponse.message);
            }

            response = response.setComplete(
            lang.msgSuccessAction('created', 'item.user'),
            dataResponse.data!
            );

            if (!manager && queryRunner) {
            await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            // rollback เฉพาะเมื่อมี transaction active จริง
            if (!manager && queryRunner && queryRunner.isTransactionActive) {
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


    
    async update(
        user_id: number,
        data: Partial<s_user>,
        manager?: EntityManager
        ): Promise<ApiResponse<s_user>> {
        let response = new ApiResponse<s_user>();
        const operation = 'UserService.update';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        try {
            const repository = useManager.getRepository(s_user);

            // ----- Validate (ยังไม่เปิด transaction) -----
            if (validate.isNullOrEmpty(user_id)) {
            return response.setIncomplete(lang.msgRequired('field.user_id'));
            }
            if (validate.isNullOrEmpty(data.username)) {
            return response.setIncomplete(lang.msgRequired('field.username'));
            }
            if (validate.isNullOrEmpty(data.user_first_name)) {
            return response.setIncomplete(lang.msgRequired('field.first_name'));
            }

            const user = await repository.findOne({ where: { user_id } });
            if (!user) {
            return response.setIncomplete(lang.msgNotFound('item.user'));
            }

            if (data.username) {
            data.username = data.username.trim();
            }
            if (data.user_email) {
            data.user_email = data.user_email.trim();
            }

            // ตรวจ username ซ้ำเมื่อมีการเปลี่ยนจริง
            if (data.username && data.username !== user.username) {
            // ถ้า checkUsernameExists รองรับ manager ให้ส่ง useManager เข้าไป
            if (await this.checkUsernameExists(data.username)) {
                return response.setIncomplete(lang.msgAlreadyExists('field.username'));
            }
            }

            // ตรวจ role_code เฉพาะเมื่อมีส่งมา
            if (data.role_code !== undefined) {
            if (validate.isNullOrEmpty(data.role_code)) {
                return response.setIncomplete(lang.msgRequired('field.role'));
            }
            const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
            if (!roleExists) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
            }

            // ----- เปิด transaction ก่อนอัปเดตจริง -----
            if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            }

            // เข้ารหัสรหัสผ่านเมื่อมีส่งมา
            if (data.password) {
            data.password = await CryptHelper.hashPassword(data.password);
            }

            const updateData: Partial<s_user> = {
            username: data.username,
            password: data.password,
            role_code: data.role_code,
            user_first_name: data.user_first_name,
            user_last_name: data.user_last_name,
            user_email: data.user_email,
            is_active: data.is_active,
            update_by: data.update_by,
            update_date: new Date(),
            };

            // ลบ key ที่เป็น undefined เพื่อกัน SET ค่าเป็น NULL โดยไม่ตั้งใจ
            Object.keys(updateData).forEach((k) => {
            if ((updateData as any)[k] === undefined) delete (updateData as any)[k];
            });

            // ถ้าไม่มีอะไรเปลี่ยนจริงๆ
            if (Object.keys(updateData).length === 0) {
            response.isCompleted = true;
            response.message = lang.msg('validation.no_changes'); // มี/ไม่มีข้อความนี้แล้วแต่ระบบคุณ
            return response;
            }

            await repository.update(user_id, updateData);

            response.isCompleted = true;
            response.message = lang.msgSuccessAction('updated', 'item.user');

            // ดึงข้อมูลล่าสุดกลับมา
            const updatedResponse = await this.getByUserId(user_id, useManager);
            if (updatedResponse.isCompleted && updatedResponse.data) {
            response.data = updatedResponse.data;
            }

            if (!manager && queryRunner && queryRunner.isTransactionActive) {
            await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            if (!manager && queryRunner && queryRunner.isTransactionActive) {
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
                response.message = lang.msgFound('item.user');
                response.data = users.map(u => ({
                    ...u,
                    fullname: `${u.user_first_name ?? ''} ${u.user_last_name ?? ''}`.trim()
                }));
            } else {
                response.message = lang.msgNotFound('item.user');
            }

            response.isCompleted = true;
            return response;
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message)); 
        }
    }

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
                // .leftJoinAndSelect('m_employee', 'employee', 'user.user_id  = employee.user_id ') // JOIN กับตาราง employee โดยตรง
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
