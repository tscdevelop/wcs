import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiResponse } from '../models/api-response.model';
import config from '../config/GlobalConfig.json';  // ใช้ import แทน require
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import { s_user } from '../entities/s_user.entity';
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

dotenv.config();

const userService = new UserService();
const JWT_SECRET = config.JwtConfig.Key;
const TOKEN_EXPIRE_MINUTES  = parseInt(config.JwtConfig.ExpireMinutes);


export const login = async (req: Request, res: Response) => {
  const operation = 'UserController.login';
  const { username, password } = req.body;
  try {
    const response = await userService.validate(username, password);
    if (response.isCompleted) {
      const token = jwt.sign({ user_id: response.data!.user_id, username: response.data!.username,role_code: response.data!.role_code }, JWT_SECRET, { expiresIn: `${TOKEN_EXPIRE_MINUTES}m` });
      const token_expire = new Date(Date.now() + TOKEN_EXPIRE_MINUTES * 60 * 1000);
      const loginResponse = {
        user_id: response.data!.user_id,
        username: response.data!.username,
        role_code: response.data!.role_code,
        token,
        token_expire
      };
      const apiResponse = response.setComplete(lang.msgSuccessfulFormat('item.login'), loginResponse, operation, username); 
      return ResponseUtils.handleResponse(res,apiResponse, true, operation, username);
    } else {
      return ResponseUtils.handleCustomResponse(res, response, HttpStatus.UNAUTHORIZED, true, operation, username);
    }
    
  } catch (error: any) {
    return ResponseUtils.handleError(res, 'UserController.login', error.message, 'item.login', true, username);
  }
};

//ของเดิม
export const create = async (req: Request, res: Response) => {
  const operation = 'UserController.create';

  console.log('Raw req.body:', req.body);

  const data: Partial<s_user> = DataSanitizer.fromObject<s_user>(req.body,s_user); 
  console.log('Parsed data:', data);

  // ตรวจสอบ username ส่งมาหรือไม่
  const reqUsername = RequestUtils.getUsernameToken(req, res);
  if (!reqUsername) return;
  
  try {

    data.create_by = reqUsername;
    const response = await userService.create(data);

    // ถ้าบันทึกไม่สำเร็จ ให้ retrun
    if (!response.isCompleted) {
      return ResponseUtils.handleResponse(res, response);
    }
    
    response.message = lang.msgSuccessAction('created', 'item.employee');
    return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED, true, reqUsername);
  } catch (error: any) {
    return ResponseUtils.handleErrorCreate(res, operation, error.message,'item.user', true, reqUsername);
  }
};

export const update = async (req: Request, res: Response) => {
  const operation = 'UserController.update';
  const { user_id } = req.params;
  console.log('Raw req.body:', req.body);

  const data: Partial<s_user> = DataSanitizer.fromObject<s_user>(req.body,s_user); 
  console.log('Parsed data:', data);

 // ตรวจสอบ username ส่งมาหรือไม่
 const reqUsername = RequestUtils.getUsernameToken(req, res);
 if (!reqUsername) return;

  //const data = req.body;
  try {

    data.update_by = reqUsername;
    const response = await userService.update(Number(user_id), data);
    return ResponseUtils.handleResponse(res, response);
    
  } catch (error: any) {
    return ResponseUtils.handleErrorUpdate(res, operation, error.message,'item.user', true, reqUsername);
  }
};

export const del = async (req: Request, res: Response) => {
  let response = new ApiResponse<void>();
  const operation = 'UserController.del';

  const { user_id } = req.params;
  // ตรวจสอบว่า user_id ถูกส่งมาหรือไม่
  if (!user_id) {
    return ResponseUtils.handleBadRequestIsRequired(res, 'field.user_id');
  }
  console.log('Raw user_id:', user_id);

  // ตรวจสอบ username ส่งมาหรือไม่
  const reqUsername = RequestUtils.getUsernameToken(req, res);
  if (!reqUsername) return;

  try {
  
    response = await userService.delete(Number(user_id));
    return ResponseUtils.handleResponse(res, response);

  } catch (error: any) {
    return ResponseUtils.handleErrorDelete(res, operation, error.message,'item.user', true, reqUsername);
  }
};

export const search = async (req: Request, res: Response) => {
  
  let response = new ApiResponse<s_user[]>();
  const operation = 'UserController.search';
  const { username, role_code } = req.query;

  // ตรวจสอบ username ส่งมาหรือไม่
  const reqUsername = req.user?.username; // ดึง username จาก headers
  if (!reqUsername) {
      return ResponseUtils.handleBadRequestIsRequired(res, 'field.username');
  }
  console.log('req reqUsername:', reqUsername);
  
  try {
    response = await userService.search(username as string, role_code as string);
    return ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    return ResponseUtils.handleErrorSearch(res, operation, error.message,'item.user',true, reqUsername);
  }
};

export const getByUserId = async (req: Request, res: Response) => {
  let response = new ApiResponse<s_user | null>();
  const operation = 'UserController.getByUserId';
  const { user_id } = req.params;
  
  // ตรวจสอบ username ส่งมาหรือไม่
  const reqUsername = RequestUtils.getUsernameToken(req, res);
  if (!reqUsername) return;

  try {
      response = await userService.getByUserId(Number(user_id));
      return ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.user', true, reqUsername);
  }
};

export const checkUsernameExists = async (req: Request, res: Response) => {
  const operation = 'UserController.checkUsernameExists';
  const { username } = req.query as { username: string };

 // ตรวจสอบ username ส่งมาหรือไม่
 const reqUsername = RequestUtils.getUsernameToken(req, res);
 if (!reqUsername) return;

  try {
    const exists = await userService.checkUsernameExists(username);
    const response = new ApiResponse({
      message: exists ? lang.msgFound('field.username') : lang.msgNotFound('field.username'),
      data: { exists },
      isCompleted: true
    });
    return ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    return ResponseUtils.handleError(res, operation, error.message,'field.username',true, reqUsername);    
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const operation = 'UserController.changePassword';
  const { user_id } = req.params;
  const { oldPassword, newPassword } = req.body;

  // ตรวจสอบ username ส่งมาหรือไม่
  const reqUsername = RequestUtils.getUsernameToken(req, res);
  if (!reqUsername) return;

  try {

    const updateBy:any = reqUsername;
    const response = await userService.changePassword(Number(user_id), oldPassword, newPassword,updateBy);
    return ResponseUtils.handleResponse(res,response, true, operation, reqUsername);
  } catch (error: any) {
    return ResponseUtils.handleErrorUpdate(res, operation, error.message,'field.password', true, reqUsername);
  }
};

// Example controller function using the user info from the token
export const getUserToken = (req: Request, res: Response) => {
  if (req.user) {
    
    const response = new ApiResponse({
      message: lang.msgSuccessfulFormat('item.user'),
      data: req.user,
      isCompleted: true,
    });
    return res.status(200).json(response);
  } else {
    res.status(403).json({
      message: 'error getUserProfile',
      isCompleted: false,
    });
    return ResponseUtils.handleError(res, 'UserController.getUserProfile', 'error getUserProfile', 'item.user');
  }
};

// 2024-08-08: ก่อนปรับรูปแบบการ retrun response และการ save log 
/* import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiResponse } from '../models/api-response.model';
import config from '../config/GlobalConfig.json';  // ใช้ import แทน require
import { msg, msgFormat } from '../utils/LangHelper';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import { s_user } from '../entities/s_user.entity';
import { UserPayload } from '../common/auth.token';


dotenv.config();

const userService = new UserService();
const JWT_SECRET = config.JwtConfig.Key;
const TOKEN_EXPIRE_MINUTES  = parseInt(config.JwtConfig.ExpireMinutes);


export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const response = await userService.validate(username, password);
    if (response.isCompleted) {
      const token = jwt.sign({ user_id: response.data!.user_id, username: response.data!.username,role: response.data!.role }, JWT_SECRET, { expiresIn: `${TOKEN_EXPIRE_MINUTES}m` });
      const token_expire = new Date(Date.now() + TOKEN_EXPIRE_MINUTES * 60 * 1000);
      const loginResponse = {
        user_id: response.data!.user_id,
        username: response.data!.username,
        role: response.data!.role,
        token,
        token_expire
      };
      const apiResponse = new ApiResponse({
        message: lang.msgSuccessfulFormat('item.login'), // msgFormat('message.successful',[msg('item.login') ]),
        data: loginResponse,
        isCompleted: true
      });
      res.status(HttpStatus.OK).json(apiResponse);
    } else {
      ResponseUtils.handleResponse(res, response, HttpStatus.UNAUTHORIZED);
    }
    
  } catch (error: any) {
    ResponseUtils.handleError(res, 'UserController.login', error.message,'item.login');
  }
};


// Example controller function using the user info from the token
export const getUserFromToken = (req: Request, res: Response) => {
  if (req.user) {
    const { user_id, username, role } = req.user;
    const response = new ApiResponse({
      message: lang.msgSuccessfulFormat('item.user'),
      data: { user_id, username, role },
      isCompleted: true,
    });
    res.status(200).json(response);
  } else {
    res.status(403).json({
      message: 'error getUserProfile',
      isCompleted: false,
    });
    ResponseUtils.handleError(res, 'UserController.getUserProfile', 'error getUserProfile', 'item.user');
  }
};

export const create = async (req: Request, res: Response) => {
  const operation = 'UserController.create';
  
  try {

    console.log('Raw req.body:', req.body);
    //const data: Partial<s_user> = DataSanitizer.parseAndSanitize<s_user>(JSON.stringify(req.body)); 
    const data: Partial<s_user> = DataSanitizer.fromObject<s_user>(req.body,s_user); 
    console.log('Parsed data:', data);

    const username = req.headers["username"]; // ดึง username จาก headers
    if (!username) {
        return ResponseUtils.handleBadRequestIsRequired(res, 'field.username');
    }
    console.log('Header username:', username);
    const createBy:any = username;

    data.create_by = createBy;
    const response = await userService.create(data);
    if (!response.isCompleted || !response.data) {
      return ResponseUtils.handleErrorCreate(res, operation, response.message, 'item.user');
    }

    const respData = response.data;
     // ดึงข้อมูลที่บันทึก
     const updatedResponse = await userService.getByUserId(respData.user_id);
     if (updatedResponse.isCompleted && updatedResponse.data) {
         response.data = updatedResponse.data;
     }
    
     response.message = lang.msgSuccessAction('created', 'item.employee');
    ResponseUtils.handleResponse(res, response, HttpStatus.CREATED);
  } catch (error: any) {
    ResponseUtils.handleErrorCreate(res, 'UserController.create', error.message,'item.user');
  }
};


export const update = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const data = req.body;
  try {
    const response = await userService.update(Number(user_id), data);
    ResponseUtils.handleResponse(res, response, HttpStatus.NO_CONTENT);
  } catch (error: any) {
    ResponseUtils.handleErrorUpdate(res, 'UserController.update', error.message,'item.user');
  }
};

export const del = async (req: Request, res: Response) => {
  let response = new ApiResponse<void>();
  const operation = 'UserController.del';
  const { user_id } = req.params;
  try {
    const { user_id } = req.params;
        console.log('Raw user_id:', user_id);
        // ตรวจสอบว่า user_id ถูกส่งมาหรือไม่
        if (!user_id) {
            return ResponseUtils.handleBadRequestIsRequired(res, 'field.user_id');
        }
    response = await userService.delete(Number(user_id));
   
        if (!response.isCompleted) {
            return ResponseUtils.handleErrorDelete(res, operation, response.message, 'item.user');
        }

        response.message = lang.msgSuccessAction('deleted', 'item.user');
        return ResponseUtils.handleResponse(res, response, HttpStatus.NO_CONTENT);
  } catch (error: any) {
    ResponseUtils.handleErrorDelete(res, operation, error.message,'item.user');
  }
};

export const search = async (req: Request, res: Response) => {
  
  let response = new ApiResponse<s_user[]>();
  const operation = 'UserController.search';
  const { username, role } = req.query;

  try {
    response = await userService.search(username as string, role as string);
    ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    ResponseUtils.handleErrorSearch(res, operation, error.message,'item.user');
  }
};

export const getByUserId = async (req: Request, res: Response) => {
  let response = new ApiResponse<s_user | null>();
  const operation = 'UserController.getByUserId';
  const { user_id } = req.params;
  const user = req.user;
  console.log('user token : ', user);
  try {
      response = await userService.getByUserId(Number(user_id));
      return ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.user');
  }
};

export const checkUsernameExists = async (req: Request, res: Response) => {
  const operation = 'UserController.checkUsernameExists';
  const { username } = req.query as { username: string };
  try {
    const exists = await userService.checkUsernameExists(username);
    const response = new ApiResponse({
      message: exists ? lang.msgFound('field.username') : lang.msgNotFound('field.username'),
      data: { exists },
      isCompleted: true
    });
    ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    ResponseUtils.handleError(res, operation, error.message,'field.username');    
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const operation = 'UserController.changePassword';
  const { user_id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {

    const username = req.headers["username"]; // ดึง username จาก headers
    if (!username) {
        return ResponseUtils.handleBadRequestIsRequired(res, 'field.username');
    }
    console.log('Header username:', username);
    const updateBy:any = username;

    const response = await userService.changePassword(Number(user_id), oldPassword, newPassword,updateBy);
    ResponseUtils.handleResponse(res, response);
  } catch (error: any) {
    ResponseUtils.handleErrorUpdate(res, operation, error.message,'field.password');
  }
};

 */

/* import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiResponse } from '../models/api-response.model';
import config from '../config/GlobalConfig.json';  // ใช้ import แทน require

dotenv.config();

const userService = new UserService();
const JWT_SECRET = config.JwtConfig.Key;
const TOKEN_EXPIRE_MINUTES  = parseInt(config.JwtConfig.ExpireMinutes);

export const createUser = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const response = await userService.create(data);
    if (response.isError) {
      return res.status(500).json(response);
    }
    if (!response.isCompleted) {
      return res.status(400).json(response);
    }
    res.status(201).json(response);
  } catch (error: any) {
    const response = new ApiResponse({
      message: 'Error creating user',
      error: error.message,
      isError: true
    });
    res.status(500).json(response);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const response = await userService.validate(username, password);
    if (response.isCompleted) {
      const token = jwt.sign({ user_id: response.data!.user_id, username: response.data!.username }, JWT_SECRET, { expiresIn: `${TOKEN_EXPIRE_MINUTES}m` });
      const token_expire = new Date(Date.now() + TOKEN_EXPIRE_MINUTES * 60 * 1000);
      const loginResponse = {
        user_id: response.data!.user_id,
        username: response.data!.username,
        role: response.data!.role,
        token,
        token_expire
      };
      res.json(new ApiResponse({
        message: 'Login successful',
        data: loginResponse,
        isCompleted: true
      }));
    } else {
      res.status(401).json(response);
    }
  } catch (error: any) {
    const response = new ApiResponse({
      message: 'Error logging in',
      error: error.message,
      isError: true
    });
    res.status(400).json(response);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const response = await userService.delete(Number(user_id));
    if (response.isCompleted) {
      res.status(204).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error: any) {
    const response = new ApiResponse({
      message: 'Error deleting user',
      error: error.message,
      isError: true
    });
    res.status(400).json(response);
  }
};

export const editUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const data = req.body;
  try {
    const response = await userService.update(Number(user_id), data);
    if (response.isCompleted) {
      res.status(204).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error: any) {
    const response = new ApiResponse({
      message: 'Error updating user',
      error: error.message,
      isError: true
    });
    res.status(400).json(response);
  }
};

export const searchUser = async (req: Request, res: Response) => {
  const { username, role } = req.query;

  try {
    const response = await userService.search(username as string, role as string);
    
    if (response.isCompleted) {
      res.json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error: any) {
    const response = new ApiResponse({
      message: 'Error searching users',
      error: error.message,
      isError: true
    });
    res.status(400).json(response);
  }
};

// ตรวจสอบว่า username มีในระบบหรือไม่
export const checkUsernameExists = async (req: Request, res: Response) => {
  const { username } = req.query as { username: string };
  try {
      const exists = await userService.checkUsernameExists(username);
      const response = new ApiResponse({
          message: exists ? 'Username exists' : 'Username does not exist',
          data: { exists },
          isCompleted: exists ? true : false
      });
      res.status(200).json(response);
  } catch (error: any) {
      const response = new ApiResponse({
          message: 'Error checking username',
          error: error.message,
          isError: true
      });
      res.status(400).json(response);
  }
};

 */