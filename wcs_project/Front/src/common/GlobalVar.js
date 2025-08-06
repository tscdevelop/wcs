import LocalStorageHelper from "../utils/LocalStorageHelper";
import * as Constants from "common/constants";
// import HospitalAPI from "api/HospitalAPI";
const StorageKeys = {
  USER_ID: "userID",
  USERNAME: "userName",
  ROLE: "role",
  USER_DATA: "userData",
  EMPLOYEE_DATA: "employeeData",
  HOSPITAL_CODE: "hospitalCode",
  HOSPITAL_NAME: "hospitalName",
  HOSPITAL_ADDRESS: "hospitalAddress",
  HOSPITAL_LOGO: "hospitalLogo",
  LANGUAGE: "language",
  FACTORY_ID: "factoryID"

  // เพิ่มคีย์อื่นๆ ตามที่ต้องการ
};

class GlobalVar {
  // ฟังก์ชันในการตั้งค่า token
  static setToken(token) {
    LocalStorageHelper.setItem(StorageKeys.TOKEN, token);
  }

  static setUserId(userID) {
    LocalStorageHelper.setItem(StorageKeys.USER_ID, userID);
  }

  static setUsername(username) {
    LocalStorageHelper.setItem(StorageKeys.USERNAME, username);
  }

  static setRole(role) {
    LocalStorageHelper.setItem(StorageKeys.ROLE, role);
  }

  static setHospitalCode(hospitalCode) {
    LocalStorageHelper.setItem(StorageKeys.HOSPITAL_CODE, hospitalCode);
  }

  static setHospitalName(hospitalName) {
    LocalStorageHelper.setItem(StorageKeys.HOSPITAL_NAME, hospitalName);
  }

  static setHospitalAddress(hospitalAddress) {
    LocalStorageHelper.setItem(StorageKeys.HOSPITAL_ADDRESS, hospitalAddress);
  }

  static setHospitalLogo(hospitalLogo) {
    LocalStorageHelper.setItem(StorageKeys.HOSPITAL_LOGO, hospitalLogo);
  }

  // ฟังก์ชันในการตั้งค่า token
  static setLanguage(language) {
    LocalStorageHelper.setItem(StorageKeys.LANGUAGE, language);
  }

  // ✅ ฟังก์ชันสำหรับบันทึก FACTORY_ID
  static setFactoryID(factoryID) {
    LocalStorageHelper.setItem(StorageKeys.FACTORY_ID, factoryID);
  }

  // ✅ ฟังก์ชันสำหรับดึง FACTORY_ID
  static getFactoryID() {
    return LocalStorageHelper.getItem(StorageKeys.FACTORY_ID);
  }

  // ✅ ฟังก์ชันสำหรับลบ FACTORY_ID
  static removeFactoryID() {
    LocalStorageHelper.removeItem(StorageKeys.FACTORY_ID);
  }

  // ฟังก์ชันในการดึงค่า token
  static getToken() {
    return LocalStorageHelper.getItem(StorageKeys.TOKEN);
  }

  static getUsername() {
    return LocalStorageHelper.getItem(StorageKeys.USERNAME);
  }

  static getRole() {
    return LocalStorageHelper.getItem(StorageKeys.ROLE);
  }

  static getUserId() {
    return LocalStorageHelper.getItem(StorageKeys.USER_ID);
  }

  // static getHospitalCode() {
  //   let hospitalCode = "";
  //   if(!LocalStorageHelper.getItem(StorageKeys.HOSPITAL_CODE))
  //   {
  //     hospitalCode = Number(Constants.DEFAULT_HOSPITAL_CODE);
  //   }
  //   else{
  //     hospitalCode = Number(LocalStorageHelper.getItem(StorageKeys.HOSPITAL_CODE));
  //   }
  //   return hospitalCode;
  // }

  // static getHospitalCode() {
  //   let hospitalCode = "";
  //   try {
  //     const storedHospitalCode = LocalStorageHelper.getItem(StorageKeys.HOSPITAL_CODE);
  //     hospitalCode = storedHospitalCode || Constants.DEFAULT_HOSPITAL_CODE;
  //   } catch (error) {
  //     console.error("Error accessing localStorage for Hospital Code:", error);
  //     hospitalCode = Constants.DEFAULT_HOSPITAL_CODE; // ใช้ค่า default เมื่อเกิด error
  //   }
  //   return hospitalCode;
  // }

  static async getHospitalName() {
    try {

      const storedHospitalName = LocalStorageHelper.getItem(StorageKeys.HOSPITAL_NAME); // ดึง hospitalName จาก LocalStorage


      // ถ้า hospitalCode ปัจจุบันตรงกับที่เคยเก็บไว้และมี hospitalName ใน LocalStorage
      if (storedHospitalName) {
        return JSON.parse(storedHospitalName); // คืนค่าจาก LocalStorage
      }



      else {
        console.warn("Hospital name not found in API response, using default names.");
        return {
          hospital_name_en: Constants.DEFAULT_LPI_NAME,
          hospital_name_th: Constants.DEFAULT_LPI_NAME,
        };
      }
    } catch (error) {
      console.error("Error fetching hospital name:", error);
      return {
        hospital_name_en: Constants.DEFAULT_LPI_NAME,
        hospital_name_th: Constants.DEFAULT_LPI_NAME,
      };
    }
  }

  // static async getHospitalAddress() {
  //   try {
  //     const currentHospitalCode = GlobalVar.getHospitalCode(); // ดึง hospitalCode ปัจจุบัน
  //     const storedHospitalAddress = LocalStorageHelper.getItem(StorageKeys.HOSPITAL_ADDRESS); // ดึง hospitalAddress จาก LocalStorage
  //     const storedHospitalCode = LocalStorageHelper.getItem(StorageKeys.HOSPITAL_CODE); // ดึง hospitalCode จาก LocalStorage

  //     // ถ้า hospitalCode ปัจจุบันตรงกับที่เคยเก็บไว้และมี hospitalAddress ใน LocalStorage
  //     if (storedHospitalAddress && currentHospitalCode === storedHospitalCode) {
  //       return JSON.parse(storedHospitalAddress); // คืนค่าจาก LocalStorage
  //     }

  //     // ถ้า hospitalCode เปลี่ยน หรือไม่มี hospitalAddress ใน LocalStorage
  //     const response = await HospitalAPI.getHospitalCODE(currentHospitalCode);

  //     if (response?.isCompleted && response?.data) {
  //       const hospitalAddress = {
  //         hospital_province: response.data.hospital_province,
  //         hospital_district: response.data.hospital_district,
  //         hospital_subdistrict: response.data.hospital_subdistrict,
  //         hospital_road: response.data.hospital_road,
  //         hospital_alley: response.data.hospital_alley,
  //         hospital_address: response.data.hospital_address,
  //         hospital_postal_code: response.data.hospital_postal_code,
  //       };

  //       // เก็บข้อมูลใน LocalStorage
  //       LocalStorageHelper.setItem(StorageKeys.HOSPITAL_ADDRESS, JSON.stringify(hospitalAddress));
  //       LocalStorageHelper.setItem(StorageKeys.HOSPITAL_CODE, currentHospitalCode);

  //       return hospitalAddress; // คืนข้อมูลที่ดึงมา
  //     } else {
  //       console.warn("Hospital address not found in API response, using default address.");
  //       return {
  //         hospital_province: "",
  //         hospital_district: "",
  //         hospital_subdistrict: "",
  //         hospital_road: "",
  //         hospital_alley: "",
  //         hospital_address: Constants.DEFAULT_HOSPITAL_ADDRESS,
  //         hospital_postal_code: "",
  //       };
  //     }
  //   } catch (error) {
  //     console.error("Error fetching hospital address:", error);
  //     return {
  //       hospital_province: "",
  //       hospital_district: "",
  //       hospital_subdistrict: "",
  //       hospital_road: "",
  //       hospital_alley: "",
  //       hospital_address: Constants.DEFAULT_HOSPITAL_ADDRESS,
  //       hospital_postal_code: "",
  //     };
  //   }
  // }

  static async getHospitalLogo() {
    try {
      return Constants.DEFAULT_LPI_LOGO;
    } catch (error) {
      console.error("Error fetching hospital logo:", error);
      return Constants.DEFAULT_LPI_LOGO;
    }
  }



  static getLanguage() {
    let language = "";
    try {
      const storedLanguage = LocalStorageHelper.getItem(StorageKeys.LANGUAGE);
      if (!storedLanguage) {
        language = Constants.DEFAULT_LANGUAGE;
      } else {
        language = storedLanguage;
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      language = Constants.DEFAULT_LANGUAGE;  // ใช้ค่าภาษาเริ่มต้นในกรณีเกิดข้อผิดพลาด
    }
    return language;
  }




  // ฟังก์ชันในการตั้งค่าข้อมูลตามคีย์
  static setDataByKey(key, data) {
    LocalStorageHelper.setItem(key, data);
  }

  // ฟังก์ชันในการดึงข้อมูลตามคีย์
  static getDataByKey(key) {
    return LocalStorageHelper.getItem(key);
  }

  // ฟังก์ชันในการลบข้อมูลตามคีย์
  static removeDataByKey(key) {
    LocalStorageHelper.removeItem(key);
  }

  // ฟังก์ชันในการลบ token
  static removeToken() {
    LocalStorageHelper.removeItem(StorageKeys.TOKEN);
  }

  // ฟังก์ชันในการลบ localstorage ทั้งหมด
  static removeForLogout() {
    LocalStorageHelper.removeItem(StorageKeys.TOKEN);
    LocalStorageHelper.removeItem(StorageKeys.USER_ID);
    LocalStorageHelper.removeItem(StorageKeys.USERNAME);
    LocalStorageHelper.removeItem(StorageKeys.ROLE);
    LocalStorageHelper.removeItem(StorageKeys.FACTORY_ID);
  }
}

export { GlobalVar, StorageKeys };