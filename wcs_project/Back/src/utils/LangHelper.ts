import i18next from 'i18next';
import { getLanguage } from '../common/language.context'; // นำเข้า getLanguage

export function msg(key: string, params?: Record<string, string | number>): string {
    const lng = getLanguage(); // ดึงค่าภาษาอัตโนมัติจาก Context
    return i18next.t(key, { ...params, lng });
}

export function msgFormat(key: string, values: string[]): string {
    let params: Record<string, string> = {};
    values.forEach((value, index) => {
        params[index.toString()] = value;
    });
    const lng = getLanguage(); // ดึงค่าภาษาอัตโนมัติจาก Context
    return i18next.t(key, { ...params, lng });
}

export function msgSuccessAction(action: 'created' | 'updated' | 'deleted' | 'returned', translationKey: string): string {
  const key = `message.${action}_successfully`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgSuccessfulFormat( translationKey: string): string {
  const key = `message.successful`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorFormat( translationKey: string): string {
  const key = `message.error_msg`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorAction(action: 'creating' | 'updating' | 'deleting' | 'searching' | 'getting' | 'uploading', translationKey: string): string {
  const key = `message.error_${action}`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorFunction(operation: string, errorMessage: string): string {
  return msgFormat('message.error_function', [operation, errorMessage]);
}

export function msgFound( translationKey: string): string {
  const key = `message.found`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgNotFound( translationKey: string): string {
  const key = `message.not_found`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgDataFound( ): string {
  return msg('message.data_found');
}

export function msgDataNotFound( ): string {
  return msg('message.data_not_found');
}

export function msgRequired( translationKey: string): string {
  const key = `validation.required`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgNotRequired( translationKey: string): string {
  const key = `validation.not_required`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgRequiredWithMultipleFields(...translationKeys: string[]): string {
  const key = `validation.required`;
  
  // แปลคีย์แต่ละตัวที่ส่งเข้ามา
  const translatedValues = translationKeys.map(key => msg(key));
  
  // รวมข้อความที่แปลแล้วด้วยช่องว่าง
  const combinedMessage = translatedValues.join(' ');

  // ใช้ combinedMessage ในการสร้างข้อความสุดท้าย
  return msgFormat(key, [combinedMessage]);
}

export function msgRequiredData( translationKey: string): string {
  const key = `validation.required_data`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgRequiredCreateby(): string {
  return msg('validation.required_createby');
}

export function msgRequiredUpdateby(): string {
  return msg('validation.required_updateby');
}

export function msgRequiredSavedataby(): string {
  return msg('validation.required_savedataby');
}

export function msgRequiredUsername(): string {
  return msg('validation.required_username');
}

export function msgAlreadyExists( translationKey: string): string {
  const key = `validation.already_exists`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgInvalidParameter(): string {
  return msg('validation.invalid_parameter');
}

export function msgInvalidFormat(translationKey: string, format?: string): string {
  const key = `validation.invalid_format`;
  const itemValue = msg(translationKey);    // ดึงข้อความที่แปลจาก translationKey เช่น "Department code"
  const formatValue = format ? format : ''; // ถ้ามีรูปแบบ ให้ใช้รูปแบบ; ถ้าไม่มีก็ปล่อยให้เป็นค่าว่าง
  return msgFormat(key, [itemValue, formatValue]);  // ฟอร์แมตข้อความโดยแทรกชื่อฟิลด์และรูปแบบ
}

export function msgMultiple(
  keys: string[], 
  params?: Record<string, string | number>, 
  separator: string = ' ' // ตัวคั่นระหว่างข้อความ
): string {
  return keys
      .map(key => i18next.t(key, params)) // แปลแต่ละ key
      .join(separator); // รวมข้อความด้วยตัวคั่น
}




// ปรับเป็น Class แต่ติดปัญหา ต้องแก้ไข เยอะ
/* import { Request } from 'express';
import i18next from 'i18next';

class LangHelper {
  private req: Request;

  constructor(req: Request) {
    this.req = req;
  }

  public lang(key: string, params?: Record<string, string | number>): string {
    const lng = this.req.language || i18next.language; // ดึงค่าภาษาอัตโนมัติจาก `i18next`
    return i18next.t(key, { ...params, lng });
  }

  public langFormat(key: string, values: string[]): string {
    let params: Record<string, string> = {};
    values.forEach((value, index) => {
      params[index.toString()] = value;
    });
    const lng = this.req.language || i18next.language; // ดึงค่าภาษาอัตโนมัติจาก `i18next`
    return i18next.t(key, { ...params, lng });
  }
}

export default LangHelper; */


// ก่อนปรับเป็น Class แก้ไขปัญหา ภาษาไม่เปลี่ยน
/* import i18next from 'i18next';

export function lang(key: string, params?: Record<string, string | number>): string {
    return i18next.t(key, params);
}

export function langFormat(key: string, values: string[]): string {
    let params: Record<string, string> = {};
    values.forEach((value, index) => {
        params[index.toString()] = value;
    });
    return i18next.t(key, params);
}
 */