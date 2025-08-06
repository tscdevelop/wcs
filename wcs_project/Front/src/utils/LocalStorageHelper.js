class LocalStorageHelper {
  // เมธอดในการบันทึกข้อมูลลง localStorage
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error.message}`);
    }
  }

  // เมธอดในการดึงข้อมูลจาก localStorage
  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error.message}`);
      return null;
    }
  }

  // เมธอดในการลบข้อมูลจาก localStorage
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error.message}`);
    }
  }

  // เมธอดในการล้างข้อมูลทั้งหมดจาก localStorage
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error.message}`);
    }
  }

  // เมธอดในการตรวจสอบว่ามี key อยู่ใน localStorage หรือไม่
  static hasItem(key) {
    return localStorage.getItem(key) !== null;
  }
}

export default LocalStorageHelper;

/* const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';
const EMPLOYEE_DATA_KEY = 'employeeData';

// ฟังก์ชันการจัดการ token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ฟังก์ชันการจัดการ userData
export function setUserData(userData) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

export function getUserData() {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function removeUserData() {
  localStorage.removeItem(USER_DATA_KEY);
}

// ฟังก์ชันการจัดการ employeeData
export function setEmployeeData(employeeData) {
  localStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(employeeData));
}

export function getEmployeeData() {
  const data = localStorage.getItem(EMPLOYEE_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function removeEmployeeData() {
  localStorage.removeItem(EMPLOYEE_DATA_KEY);
}

// ฟังก์ชันเพิ่มเติมสำหรับการเข้าถึงข้อมูลเฉพาะ
export function getUserId() {
  const userData = getUserData();
  return userData ? userData.user.user_id : null;
}
 */