// 2024-08-08 : aek : ปรับปรุง ResponseUtils เพื่อรองรับการกำหนดว่าจะบันทึก log หรือไม่ และสามารถส่ง username เพื่อนำไปบันทึก log ได้ พร้อมทั้งเปลี่ยนชื่อ parameter functionName เป็น operation:
// ตัดพารามิเตอร์ successStatusCode ออกไปและใช้การตรวจสอบสถานะในฟังก์ชัน handleResponse 
// ปรับปรุง ResponseUtils เพื่อรองรับสถานะ HTTP ที่กำหนดเองเมื่อมีความจำเป็น
// HttpStatus.ts (or ResponseUtils.ts)

/* 
สรุปการใช้ HttpStatus
OK (200): ใช้เมื่อการอ่านข้อมูลสำเร็จ (Read)
Created (201): ใช้เมื่อทรัพยากรถูกสร้างขึ้นใหม่ (Create)
No Content (204): ใช้เมื่อการอัปเดตข้อมูลสำเร็จโดยไม่ต้องส่งข้อมูลกลับ (Update) หรือเมื่อการลบทรัพยากรสำเร็จแล้ว (Delete)
Bad Request (400): ใช้เมื่อคำขอไม่ถูกต้อง หรือมีข้อผิดพลาดในข้อมูลที่ส่งมา
Unauthorized (401): ใช้เมื่อการรับรองสิทธิ์ล้มเหลว หรือไม่มีสิทธิ์เพียงพอในการเข้าถึงทรัพยากร
Forbidden (403): ใช้เมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงทรัพยากรที่ร้องขอ แม้จะมีการรับรองสิทธิ์แล้วก็ตาม
Not Found (404): ใช้เมื่อไม่พบทรัพยากรที่ร้องขอ
Conflict (409): ใช้เมื่อเกิดความขัดแย้งในการร้องขอ เช่น ข้อมูลที่ซ้ำซ้อนกัน
Internal Server Error (500): ใช้เมื่อเกิดข้อผิดพลาดในเซิร์ฟเวอร์และไม่สามารถดำเนินการตามคำขอได้
Bad Gateway (502): ใช้เมื่อเซิร์ฟเวอร์ที่ทำหน้าที่เกตเวย์หรือพร็อกซีได้รับการตอบสนองที่ไม่ถูกต้องจากเซิร์ฟเวอร์ต้นทาง
Service Unavailable (503): ใช้เมื่อเซิร์ฟเวอร์ไม่สามารถจัดการกับคำขอเนื่องจากกำลังซ่อมบำรุงหรือมีการใช้งานสูงเกินไป
*/
export enum HttpStatus {
  /**
   * 200 OK
   * ใช้เมื่อการอ่านข้อมูลสำเร็จ (Read)
   */
  OK = 200,

  /**
   * 201 Created
   * ใช้เมื่อทรัพยากรถูกสร้างขึ้นใหม่ (Create)
   */
  CREATED = 201,

  /**
   * 204 No Content
   * ใช้เมื่อการอัปเดตข้อมูลสำเร็จโดยไม่ต้องส่งข้อมูลกลับ (Update) 
   * หรือเมื่อการลบทรัพยากรสำเร็จแล้ว (Delete)
   */
  NO_CONTENT = 204,

  /**
   * 400 Bad Request
   * ใช้เมื่อคำขอไม่ถูกต้อง หรือมีข้อผิดพลาดในข้อมูลที่ส่งมา
   */
  BAD_REQUEST = 400,

  /**
   * 401 Unauthorized
   * ใช้เมื่อการรับรองสิทธิ์ล้มเหลว หรือไม่มีสิทธิ์เพียงพอในการเข้าถึงทรัพยากร
   */
  UNAUTHORIZED = 401,

  /**
   * 403 Forbidden
   * ใช้เมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงทรัพยากรที่ร้องขอ แม้จะมีการรับรองสิทธิ์แล้วก็ตาม
   */
  FORBIDDEN = 403,

  /**
   * 404 Not Found
   * ใช้เมื่อไม่พบทรัพยากรที่ร้องขอ
   */
  NOT_FOUND = 404,

  /**
   * 409 Conflict
   * ใช้เมื่อเกิดความขัดแย้งในการร้องขอ เช่น ข้อมูลที่ซ้ำซ้อนกัน
   */
  CONFLICT = 409,

  /**
   * 500 Internal Server Error
   * ใช้เมื่อเกิดข้อผิดพลาดในเซิร์ฟเวอร์และไม่สามารถดำเนินการตามคำขอได้
   */
  INTERNAL_SERVER_ERROR = 500,

  /**
   * 502 Bad Gateway
   * ใช้เมื่อเซิร์ฟเวอร์ที่ทำหน้าที่เกตเวย์หรือพร็อกซีได้รับการตอบสนองที่ไม่ถูกต้องจากเซิร์ฟเวอร์ต้นทาง
   */
  BAD_GATEWAY = 502,

  /**
   * 503 Service Unavailable
   * ใช้เมื่อเซิร์ฟเวอร์ไม่สามารถจัดการกับคำขอเนื่องจากกำลังซ่อมบำรุงหรือมีการใช้งานสูงเกินไป
   */
  SERVICE_UNAVAILABLE = 503,

  // Add other statuses as needed
}

import { Response } from 'express';
import { ApiResponse } from '../models/api-response.model';
import * as lang from './LangHelper';

class ResponseUtils {
  /**
   * จัดการการตอบกลับ HTTP response ตามสถานะของ ApiResponse
   * @param res - Express Response object
   * @param response - ApiResponse object ที่มีสถานะและข้อมูลที่ต้องการส่งกลับ
   * @param log - Boolean flag to determine if the log should be saved
   * @param username - ชื่อผู้ใช้ที่ทำการ operation
   */
  static handleResponse<T>(res: Response, response: ApiResponse<T>, log: boolean = false, operation: string='', username: string = '') {
    if (log) {
      response.savelog(operation, username);
    }
    console.log('response :',response);
    if (response.isError) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    } else if (response.isCompleted) {
      res.status(HttpStatus.OK).json(response);
    } else {
      res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  /**
   * จัดการการตอบกลับ HTTP response ตามสถานะของ ApiResponse และสามารถกำหนดสถานะ HTTP เองได้
   * @param res - Express Response object
   * @param response - ApiResponse object ที่มีสถานะและข้อมูลที่ต้องการส่งกลับ
   * @param status - HTTP status code ที่ต้องการใช้ในการตอบกลับ
   * @param log - Boolean flag to determine if the log should be saved
   * @param username - ชื่อผู้ใช้ที่ทำการ operation
   */
  static handleCustomResponse<T>(res: Response, response: ApiResponse<T>, status: HttpStatus, log: boolean = false, operation: string='', username: string = '') {
    if (log) {
      response.savelog(operation, username);
    }
    res.status(status).json(response);
  }

  static handleBadRequestIsRequired<T>(res: Response, translationKey: string, log: boolean = false, operation: string='', username: string = '') {
    const response = new ApiResponse<T>({
      isCompleted: false,
      message: lang.msgRequired(translationKey)
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.BAD_REQUEST).json(response);
  }

  static handleBadRequest<T>(res: Response, message: string, log: boolean = false, operation: string='', username: string = '') {
    const response = new ApiResponse<T>({
      isCompleted: false,
      message: lang.msg(message)
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.BAD_REQUEST).json(response);
  }

  static handleError<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorFormat(translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorCreate<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('creating', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorUpdate<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('updating', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorDelete<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('deleting', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorSearch<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('searching', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorGet<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('getting', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  static handleErrorUpload<T>(res: Response, operation: string, errorMessage: string, translationKey: string, log: boolean = false, username: string = '') {
    const response = new ApiResponse<T>({
      message: lang.msgErrorAction('uploading', translationKey),
      error: lang.msgErrorFunction(operation, errorMessage),
      isError: true
    });
    if (log) {
      response.savelog(operation, username);
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
}

export default ResponseUtils;

// 2024-08-28 : ก่อน นี่คือการปรับปรุง ResponseUtils เพื่อรองรับการกำหนดว่าจะบันทึก log หรือไม่ และสามารถส่ง username เพื่อนำไปบันทึก log ได้ พร้อมทั้งเปลี่ยนชื่อ parameter functionName เป็น operation:
// // HttpStatus.ts (or ResponseUtils.ts)
// export enum HttpStatus {
//     OK = 200,
//     CREATED = 201,
//     NO_CONTENT = 204,
//     BAD_REQUEST = 400,
//     UNAUTHORIZED = 401,
//     INTERNAL_SERVER_ERROR = 500,
//     // Add other statuses as needed
//   }
  
//   import { Response } from 'express';
//   import { ApiResponse } from '../models/api-response.model';
//   import * as lang from '../utils/LangHelper';
  
//   class ResponseUtils {

//     /**
//    * จัดการการตอบกลับ HTTP response ตามสถานะของ ApiResponse
//    * @param res - Express Response object
//    * @param response - ApiResponse object ที่มีสถานะและข้อมูลที่ต้องการส่งกลับ
//    * @param successStatusCode - HTTP status code สำหรับการตอบกลับที่สำเร็จ (ค่าเริ่มต้นคือ 200)
//    */
//     static handleResponse<T>(res: Response, response: ApiResponse<T>, successStatusCode: HttpStatus = HttpStatus.OK) {
//       if (response.isError) {
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       } else if (response.isCompleted) {
//         res.status(successStatusCode).json(response);
//       } else {
//         res.status(HttpStatus.BAD_REQUEST).json(response);
//       }
//     }
  
//     static handleBadRequestIsRequired<T>(res: Response,  translationKey: string) {
//       const response = new ApiResponse<T>({
//         isCompleted: false,
//         message:  lang.msgRequired(translationKey)
//       });
//       res.status(HttpStatus.BAD_REQUEST).json(response);
//     }

//     static handleBadRequest<T>(res: Response,  message :string) {
//       const response = new ApiResponse<T>({
//         isCompleted: false,
//         message:  lang.msg(message)
//       });
//       res.status(HttpStatus.BAD_REQUEST).json(response);
//     }

//     /**
//    * จัดการ error response เมื่อเกิดข้อผิดพลาดใน Controller method
//    * @param res - Express Response object
//    * @param functionName - ชื่อ ฟังก์ชั่น ที่เกิดข้อผิดพลาด (ชื่อคลาส.ชื่อฟังก์ชั่น)
//    * @param errorMessage - ข้อความ error ที่เกิดขึ้น
//    * @param translationKey - ชื่อของ Key ที่เกี่ยวในไฟล์ translation.json จะแสดงใน ในข้อความ Error
//    */
//     static handleError<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorFormat(translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorCreate<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('creating',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorUpdate<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('updating',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorDelete<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('deleting',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorSearch<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('searching',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorGet<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('getting',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }

//       static handleErrorUpload<T>(res: Response, functionName: string, errorMessage: string,  translationKey: string) {
//         const response = new ApiResponse<T>({
//           message:  lang.msgErrorAction('uploading',translationKey),
//           error: lang.msgErrorFunction(functionName, errorMessage),
//           isError: true
//         });
//         response.savelog(functionName);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
//       }
//   }
  
//   export default ResponseUtils;
  