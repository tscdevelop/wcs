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
import { s_user_permis_group } from '../entities/s_user_permis_group.entity';

export class UserService {
    // private userRepository: Repository<s_user>;
    // roleRepository: any;
    // roleService: any;
    private userRepository: Repository<s_user>;
    private userPermisGroupRepository: Repository<s_user_permis_group>;
    private roleService: RoleService; // กำหนด RoleService

    constructor() {
        this.userRepository = AppDataSource.getRepository(s_user);
        this.userPermisGroupRepository = AppDataSource.getRepository(s_user_permis_group);
        this.roleService = new RoleService();
    }

    /**
     * ตรวจสอบและยืนยันผู้ใช้
     * @param username ชื่อผู้ใช้
     * @param password รหัสผ่าน
     * @returns ApiResponse ที่มีข้อมูลผู้ใช้หรือข้อความแสดงข้อผิดพลาด
     */
    // async validate(username: string, password: string): Promise<ApiResponse<s_user>> {
    //     let response = new ApiResponse<s_user>();
    //     const operation = 'UserService.validate';
    //     try {
    //         // แนะนำให้ trim จะได้ไม่พลาดช่องว่างหัวท้าย
    //         const uname = (username ?? '').trim();
    //         const pwd   = password ?? '';

    //         // ✅ ขาดฟิลด์ไหนให้ return ทันที
    //         if (validate.isNullOrEmpty(uname)) {
    //         return response.setIncomplete(lang.msgRequired('field.username'));
    //         }
    //         if (validate.isNullOrEmpty(pwd)) {
    //         return response.setIncomplete(lang.msgRequired('field.password'));
    //         }

    //         // หา user ที่ active
    //         const user = await this.userRepository.findOne({ where: { username: uname, is_active: true } });

    //         // ตรวจรหัสผ่าน
    //         if (user && await CryptHelper.comparePassword(pwd, user.password)) {
    //         response.message = lang.msgSuccessfulFormat('item.login');
    //         response.data = user;
    //         response.isCompleted = true;
    //         return response;
    //         }

    //         // ข้อมูลเข้าผิด
    //         response.message = lang.msg('validation.invalid_credentials');
    //         response.isCompleted = false;
    //         return response;

    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     }
    // }

    async validate(
        username: string,
        password: string
        ): Promise<ApiResponse<{ user: s_user; mc_codes: string[] }>> {

        const response = new ApiResponse<{ user: s_user; mc_codes: string[] }>();
        const operation = 'UserService.validate';

        try {
            const uname = (username ?? '').trim();
            const pwd = password ?? '';

            // validate input
            if (!uname) {
            return response.setIncomplete(lang.msgRequired('field.username'));
            }
            if (!pwd) {
            return response.setIncomplete(lang.msgRequired('field.password'));
            }

            // 1️⃣ หา user
            const user = await this.userRepository.findOne({
            where: { username: uname, is_active: true },
            });

            if (!user) {
            response.message = lang.msg('validation.invalid_credentials');
            return response;
            }

            // 2️⃣ เช็ครหัสผ่าน
            const isMatch = await CryptHelper.comparePassword(pwd, user.password);
            if (!isMatch) {
            response.message = lang.msg('validation.invalid_credentials');
            return response;
            }

            // 3️⃣ ดึง mc_code จาก s_user_permis_group (หลายค่า)
            const permisGroups = await this.userPermisGroupRepository.find({
            where: { user_id: user.user_id },
            select: ['mc_code'],
            });

            const mc_codes = permisGroups.map(p => p.mc_code);

            // 4️⃣ คืนค่า (ไม่ยัดใส่ s_user)
            response.data = {
            user,
            mc_codes,
            };

            response.isCompleted = true;
            response.message = lang.msgSuccessfulFormat('item.login');
            return response;

        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }


    async create(
        data: Partial<s_user> & { mc_code?: string[] },
        manager?: EntityManager
        ): Promise<ApiResponse<s_user>> {

        let response = new ApiResponse<s_user>();
        let userData = new s_user();
        const operation = 'UserService.create';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(
            lang.msg('validation.no_entityManager_or_queryRunner_available')
            );
        }

        try {
            const userRepo = useManager.getRepository(s_user);
            const upgRepo = useManager.getRepository(s_user_permis_group);

            // ---------- Validation ----------
            if (validate.isNullOrEmpty(data.role_code)) {
            return response.setIncomplete(lang.msgRequired('field.role'));
            }

            const roleExists = await this.roleService.checkRoleCodeExists(data.role_code!);
            if (!roleExists) {
            return response.setIncomplete(lang.msgNotFound('item.role'));
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

            data.username = data.username!.trim();

            const existingUser = await userRepo.findOne({
            where: { username: data.username }
            });
            if (existingUser) {
            return response.setIncomplete(lang.msgAlreadyExists('field.username'));
            }

            // ---------- Transaction ----------
            if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            }

            data.password = await CryptHelper.hashPassword(data.password!);

            Object.assign(userData, data);
            userData.create_date = new Date();
            userData.role_code = data.role_code!;

            const savedUser = await userRepo.save(userRepo.create(userData));

            // ---------- SAVE mc_code ----------
            if (Array.isArray(data.mc_code) && data.mc_code.length > 0) {
            const rows = data.mc_code.map(mc => {
                const upg = new s_user_permis_group();
                upg.user_id = savedUser.user_id!;
                upg.mc_code = mc;
                return upg;
            });

            await upgRepo.save(rows);
            }

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
            if (!manager && queryRunner?.isTransactionActive) {
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
            data: Partial<s_user> & { mc_code?: string[] },
            manager?: EntityManager
        ): Promise<ApiResponse<s_user>> {

        let response = new ApiResponse<s_user>();
        const operation = 'UserService.update';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(
            lang.msg('validation.no_entityManager_or_queryRunner_available')
            );
        }

        try {
            const userRepo = useManager.getRepository(s_user);
            const upgRepo = useManager.getRepository(s_user_permis_group);

            // ---------- Validation ----------
            if (!user_id) {
            return response.setIncomplete(lang.msgRequired('field.user_id'));
            }

            const user = await userRepo.findOne({ where: { user_id } });
            if (!user) {
            return response.setIncomplete(lang.msgNotFound('item.user'));
            }

            if (data.username) data.username = data.username.trim();
            if (data.user_email) data.user_email = data.user_email.trim();

            if (data.username && data.username !== user.username) {
            if (await this.checkUsernameExists(data.username)) {
                return response.setIncomplete(lang.msgAlreadyExists('field.username'));
            }
            }

            if (data.role_code !== undefined) {
            if (!data.role_code) {
                return response.setIncomplete(lang.msgRequired('field.role'));
            }
            const roleExists = await this.roleService.checkRoleCodeExists(data.role_code);
            if (!roleExists) {
                return response.setIncomplete(lang.msgNotFound('item.role'));
            }
            }

            // ---------- Begin Transaction ----------
            if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            }

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

            // ลบ undefined ออก
            Object.keys(updateData).forEach((k) => {
            if ((updateData as any)[k] === undefined) {
                delete (updateData as any)[k];
            }
            });

            if (Object.keys(updateData).length > 0) {
            await userRepo.update(user_id, updateData);
            }

            // ---------- UPDATE mc_code ↔ user ----------
            if (Array.isArray(data.mc_code)) {

            // ลบความสัมพันธ์เดิมทั้งหมด
            await upgRepo.delete({ user_id });

            const cleanMcCodes = [...new Set(
                data.mc_code
                .map(mc => mc?.trim())
                .filter(mc => mc)
            )];

            if (cleanMcCodes.length > 0) {
                const rows = cleanMcCodes.map(mc => {
                const upg = new s_user_permis_group();
                upg.user_id = user_id;
                upg.mc_code = mc;
                return upg;
                });

                await upgRepo.save(rows);
            }
            }

            if (!manager && queryRunner?.isTransactionActive) {
            await queryRunner.commitTransaction();
            }

            // ---------- Response ----------
            const updatedResponse = await this.getByUserId(user_id, useManager);
            if (!updatedResponse.isCompleted) {
            throw new Error(updatedResponse.message);
            }

            return response.setComplete(
            lang.msgSuccessAction('updated', 'item.user'),
            updatedResponse.data!
            );

        } catch (error: any) {
            if (!manager && queryRunner?.isTransactionActive) {
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
    // async search(username?: string, role_code?: string): Promise<ApiResponse<s_user[]>> {
    //     const whereConditions: any = { is_active: true };
    //     let response = new ApiResponse<s_user[]>();
    //     const operation = 'UserService.search';
    //     try {
    //         if (username) {
    //             whereConditions.username = Like(`%${username}%`);
    //         }
    //         if (role_code) {
    //             whereConditions.role_code = Like(`%${role_code}%`);
    //         }

    //         const users = await this.userRepository.find({ where: whereConditions });

    //         if (users.length > 0) {
    //             response.message = lang.msgFound('item.user');
    //             response.data = users.map(u => ({
    //                 ...u,
    //                 fullname: `${u.user_first_name ?? ''} ${u.user_last_name ?? ''}`.trim()
    //             }));
    //         } else {
    //             response.message = lang.msgNotFound('item.user');
    //         }

    //         response.isCompleted = true;
    //         return response;
    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message)); 
    //     }
    // }
    
    async search(
        username?: string,
        role_code?: string
    ): Promise<ApiResponse<any[]>> {

        let response = new ApiResponse<any[]>();
        const operation = 'UserService.search';

        try {
            const qb = this.userRepository
                .createQueryBuilder('user')
                .select([
                    'user.user_id AS user_id',
                    'user.username AS username',
                    'user.role_code AS role_code',
                    'user.user_first_name AS user_first_name',
                    'user.user_last_name AS user_last_name',
                    'user.user_email AS user_email',
                    'user.is_active AS is_active',
                    'user.create_date AS create_date',
                    'user.create_by AS create_by',
                    'user.update_date AS update_date',
                    'user.update_by AS update_by',
                ])
                // 👉 subquery เอา mc_code ตัวแรก
                .addSelect(subQuery => {
                    return subQuery
                        .select('upg.mc_code')
                        .from('s_user_permis_group', 'upg')
                        .where('upg.user_id = user.user_id')
                        .limit(1);
                }, 'mc_code')
                .where('user.is_active = :is_active', { is_active: true });

            if (username) {
                qb.andWhere('user.username LIKE :username', {
                    username: `%${username}%`,
                });
            }

            if (role_code) {
                qb.andWhere('user.role_code LIKE :role_code', {
                    role_code: `%${role_code}%`,
                });
            }

            const users = await qb.getRawMany();

            if (users.length > 0) {
                response.message = lang.msgFound('item.user');
                response.data = users.map(u => ({
                    ...u,
                    fullname: `${u.user_first_name ?? ''} ${u.user_last_name ?? ''}`.trim(),
                }));
            } else {
                response.message = lang.msgNotFound('item.user');
                response.data = [];
            }

            response.isCompleted = true;
            return response;

        } catch (error: any) {
            throw new Error(
                lang.msgErrorFunction(operation, error.message)
            );
        }
    }


    // async getByUserId(user_id: number, manager?: EntityManager): Promise<ApiResponse<s_user | null>> {
    //     let response = new ApiResponse<s_user | null>();
    //     const operation = 'UserService.getByUserId';
        
    //     // ตรวจสอบว่า user_id นั้นถูกต้องหรือไม่
    //     if (user_id <= 0 || isNaN(user_id)) {
    //         return response.setIncomplete(lang.msg('validation.invalid_parameter')); 
    //     }
        
    //     try {
    //         const repository = manager ? manager.getRepository(s_user) : this.userRepository;
    
    //         // ใช้ QueryBuilder ทำการ JOIN โดยอ้างถึง foreign key โดยตรง
    //         const user = await repository.createQueryBuilder('user')
    //             .where('user.user_id = :user_id', { user_id })
    //             .getOne();
    
    //         if (!user) {
    //             return response.setIncomplete(lang.msgNotFound('item.user')); 
    //         }
    
    //         // ส่ง response กลับหากพบข้อมูล user
    //         response = new ApiResponse<s_user | null>({
    //             message: lang.msgFound('item.user'),
    //             data: user,
    //             isCompleted: true
    //         });
    //         return response;
    
    //     } catch (error: any) {
    //         throw new Error(lang.msgErrorFunction(operation, error.message)); 
    //     }
    // }

    async getByUserId(
        user_id: number,
        manager?: EntityManager
    ): Promise<ApiResponse<s_user | null>> {

        let response = new ApiResponse<s_user | null>();
        const operation = 'UserService.getByUserId';

        if (!user_id || user_id <= 0) {
            return response.setIncomplete(lang.msg('validation.invalid_parameter'));
        }

        try {
            const repo = manager
                ? manager.getRepository(s_user)
                : this.userRepository;

            const qb = repo.createQueryBuilder('user');

            // subquery: เอา mc_code ตัวแรกที่เจอของ user นี้
            qb.addSelect(subQuery => {
                return subQuery
                    .select('upg.mc_code')
                    .from(s_user_permis_group, 'upg')
                    .where('upg.user_id = user.user_id')
                    .limit(1);
            }, 'mc_code');

            const rawAndEntity = await qb
                .where('user.user_id = :user_id', { user_id })
                .getRawAndEntities();

            const user = rawAndEntity.entities[0];

            if (!user) {
                return response.setIncomplete(lang.msgNotFound('item.user'));
            }

            // inject mc_code จาก raw
            (user as any).mc_code = rawAndEntity.raw[0]?.mc_code ?? null;

            response = response.setComplete(
                lang.msgFound('item.user'),
                user
            );

            return response;

        } catch (error: any) {
            throw new Error(
                lang.msgErrorFunction(operation, error.message)
            );
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
