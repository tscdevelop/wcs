import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper';
import RequestUtils from '../utils/RequestUtils';
import { DataSanitizer } from '../utils/DataSanitizer';
import { s_role } from '../entities/s_role.entity';
import { RoleUpdateModel, RoleCreateModel } from '../models/role.model';
import { ApiResponse } from '../models/api-response.model';
import { getLanguage } from '../common/language.context';

dotenv.config();

const roleService = new RoleService();

// Controller สำหรับการสร้าง role ใหม่
export const create = async (req: Request, res: Response) => {
    const operation = 'RoleController.create';
    console.log("operation : ", operation);

    // รับ username จาก token ที่แนบมากับ request
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        //const { role_code, role_name, role_decription, role_is_active } = req.body;
        console.log("req.body : ", req.body);

        // ใช้ DataSanitizer เพื่อแปลงและ sanitize ข้อมูลจาก req.body ไปยัง RoleUpdateModel
        let data: Partial<RoleCreateModel> = DataSanitizer.fromObject<RoleCreateModel>(req.body, RoleCreateModel);

           // บันทึกชื่อผู้ที่แก้ไข role
        data.create_by = reqUsername;

        console.log('Sanitized data : ', JSON.stringify(data, null, 2));

        // เรียกใช้ service สำหรับสร้าง role
        const response = await roleService.create(data);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

// Controller สำหรับการแก้ไข role ที่มีอยู่
export const update = async (req: Request, res: Response) => {
    const operation = 'RoleController.update';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { role_code } = req.params; // รับ role_code จาก URL

    if (!role_code) {
        return ResponseUtils.handleBadRequestIsRequired(res, 'field.role_code');
    }

    console.log('Raw req.body : ', req.body);

    try {
        // ใช้ DataSanitizer เพื่อแปลงและ sanitize ข้อมูลจาก req.body ไปยัง RoleUpdateModel
        let data: Partial<RoleUpdateModel> = DataSanitizer.fromObject<RoleUpdateModel>(req.body, RoleUpdateModel);

        // บันทึกชื่อผู้ที่แก้ไข role
        data.update_by = reqUsername;

        console.log('Sanitized data : ', JSON.stringify(data, null, 2));

        const response = await roleService.update(role_code, data);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error('Error during role update:', error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

// Controller สำหรับการลบ role ตาม role_code
export const del = async (req: Request, res: Response) => {
    const operation = 'RoleController.delete';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { role_code } = req.params; // รับ role_code จาก URL

    if (!role_code) {
        return ResponseUtils.handleBadRequestIsRequired(res, 'field.role_code');
    }

    try {
        // เรียกใช้ service สำหรับลบ role
        const response = await roleService.delete(role_code);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

// Controller สำหรับการตรวจสอบว่า role_code มีอยู่หรือไม่
export const checkCodeExists = async (req: Request, res: Response) => {
    const operation = 'RoleController.checkCodeExists';
    // รับ username จาก token ที่แนบมากับ request
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    // ดึง role_code ที่ต้องการตรวจสอบจาก query parameters
    const { role_code } = req.query;

    try {
        // เรียกใช้ service สำหรับตรวจสอบว่า role_code มีอยู่หรือไม่
        const response = await roleService.codeExists(role_code as string);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // หากเกิดข้อผิดพลาด ส่งข้อความแจ้งกลับไปยัง client
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

// Controller สำหรับค้นหา roles
export const search = async (req: Request, res: Response) => {
    const operation = 'RoleController.search';
    // รับ username จาก token ที่แนบมากับ request
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    // ดึงค่าที่ใช้ในการค้นหาจาก query parameters
    const { role_code, name } = req.query;
    try {
        // เรียกใช้ service สำหรับค้นหา roles
        const response = await roleService.search(role_code as string, name as string);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // หากเกิดข้อผิดพลาด ส่งข้อความแจ้งกลับไปยัง client พร้อมข้อมูลการค้นหา
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

// Controller สำหรับการดึงข้อมูล role โดยใช้ role_code
export const getByRoleCode = async (req: Request, res: Response) => {
    const operation = 'RoleController.getByRoleCode';
    // รับ username จาก token ที่แนบมากับ request
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    // ดึง role_code ที่ต้องการดึงข้อมูลจาก query parameters
    const { role_code } = req.params;
    console.log("role_code : " ,role_code);

    try {
        // เรียกใช้ service สำหรับดึงข้อมูล role และสิทธิ์ที่เกี่ยวข้อง
        const response = await roleService.getByRoleCode(role_code as string);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // หากเกิดข้อผิดพลาด ส่งข้อความแจ้งกลับไปยัง client
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqUsername);
    }
};


export const getPermissionByRole = async (req: Request, res: Response) => {
    const operation = 'RoleController.getPermissionByRole';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { role_code } = req.params;

    // ตรวจสอบว่า role_code มีค่าหรือไม่
    if (!role_code) {
        return ResponseUtils.handleErrorSearch(res, operation, "Role code is missing", 'item.role', true, reqUsername);
    }

    console.log("role_code : ", role_code);

    try {
        // เรียก service เพื่อนำข้อมูลมาใช้
        const response = await roleService.getPermissionByRole(role_code as string);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error('Error in getPermissionByRole:', error.message);
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqUsername);
    }
};

export const getMenuByPermission = async (req: Request, res: Response) => {
    const operation = 'RoleController.getMenuByPermission';
    const reqRole = RequestUtils.getRoleToken(req, res);
    if (!reqRole) return;
    
    console.log('params:', req.params);
    let { role_code } = req.params;
    console.log('role_codeee:', role_code);

    // ใช้ role_code จากพารามิเตอร์ถ้ามี หรือจาก token ถ้าไม่มีพารามิเตอร์
    if (role_code === '' || role_code === '{role_code}') {
        role_code = reqRole;
    }

    console.log("role_code:", role_code);

    if (!role_code) {
        return ResponseUtils.handleErrorSearch(res, operation, "Role code is missing", 'item.role', true, reqRole);
    }

    try {
        // เรียก service เพื่อนำข้อมูลมาใช้
        const response = await roleService.getMenuByPermission(role_code as string);
        // console.log('service response:', response);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error('Error in getMenuByPermission:', error.message);
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqRole);
    }
};


export const getPermissionAction = async (req: Request, res: Response) => {
    const operation = 'RoleController.getPermissionAction';
    
    // ตรวจสอบ token เพื่อนำ role_code ออกมา
    const reqRole = RequestUtils.getRoleToken(req, res);
    if (!reqRole) return;

    // รับ role_code จาก params หรือใช้จาก token หากไม่มีใน params
    const { role_code: paramRoleCode, menu_id } = req.params;

    // ใช้ role_code จากพารามิเตอร์ถ้ามี หรือจาก token ถ้าไม่มีพารามิเตอร์
    const role_code = paramRoleCode || reqRole;

    // ตรวจสอบว่า role_code และ menu_id มีค่าหรือไม่
    if (!role_code || !menu_id) {
        return ResponseUtils.handleErrorSearch(res, operation, "Missing role_code or menu_id", 'item.role', true, reqRole);
    }

    try {
        // เรียก service เพื่อนำข้อมูล action สิทธิ์จาก role_code และ menu_id
        const response = await roleService.getPermissionAction(role_code as string, parseInt(menu_id));
        
        // ส่งข้อมูลกลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error('Error in getPermissionAction:', error.message);
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.role', true, reqRole);
    }
};

