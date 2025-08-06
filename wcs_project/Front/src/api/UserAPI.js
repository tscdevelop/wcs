import { GlobalVar, StorageKeys } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class UserApi {

  static async getUserDataById(userID) {
    try {
      const token = GlobalVar.getToken();
      console.log("getUserDataById Token:", token );
      if (!token) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Token not found in GlobalVar",
          data: null,
          error: "Token not found in GlobalVar"
        });
      }

      const endpoint = `/api/users/get-by-user-id/${userID}`;
      // console.log('Request Endpoint:', endpoint);
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      // console.log('API Response:', apiResponse);

      // Mapping response to ApiResponse format
      const response = new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

      return response;

    } catch (error) {
      console.error( error.message || error);
      return {
        isCompleted: false,
        isError: true,
        message: error.message ,
        data: null,
        error: error.message 
      };
    }
  }

  static async login(username, password) {
    try {
      const data = { username, password };
      const endpoint = "/api/users/login";
     
      const apiResponse = await ApiProvider.postData(endpoint, data);
  
    
  
      // ตรวจสอบว่า apiResponse มีค่าที่ต้องการ
      if (apiResponse && apiResponse.data && apiResponse.data.token) {
        return new ApiResponse({
          isCompleted: true,
          isError: false,
          message: "Login successful",
          data: apiResponse.data
        });
      } else {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Login failed",
          data: null,
          error: "Invalid response format"
        });
      }
    } catch (error) {
      console.error( error.message || error);
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message ,
        data: null,
        error: error.message 
      });
    }
  }

  // static async login(username, password) {
  //   try {
  //     const data = { username, password };
  //     const endpoint = `/api/users/login`;
  //     console.log('Request Endpoint:', endpoint);
      
  //     // เรียก API เพื่อ login
  //     const apiResponse = await ApiProvider.postData(endpoint, data);
  //     console.log('API Response:', apiResponse);
  
  //     // ตรวจสอบว่าการตอบกลับจาก API มี token และ role_code หรือไม่
  //     if (apiResponse && apiResponse.data && apiResponse.data.token) {
  //       GlobalVar.setToken(apiResponse.data.token);  // เก็บ token ใน GlobalVar
  //       GlobalVar.setRole(apiResponse.data.role);  // เก็บ role_code ใน GlobalVar
  //       GlobalVar.setUserId(apiResponse.data.userID);  // เก็บ user ID ใน GlobalVar
  //       GlobalVar.setUsername(apiResponse.data.username);  // เก็บ username ใน GlobalVar
  
  //       return new ApiResponse({
  //         isCompleted: true,
  //         isError: false,
  //         message: 'Login successful',
  //         data: apiResponse.data
  //       });
  //     } else {
  //       return new ApiResponse({
  //         isCompleted: false,
  //         isError: true,
  //         message: 'Login failed',
  //         data: null,
  //         error: 'Invalid response format'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error call api user data:', error.message || error);
  //     return new ApiResponse({
  //       isCompleted: false,
  //       isError: true,
  //       message: error.message || 'Error call api user data',
  //       data: null,
  //       error: error.message || 'Error call api user data'
  //     });
  //   }
  // }
  
  
  static handleTokenExpiration() {
   
    GlobalVar.removeToken();
    GlobalVar.removeDataByKey(StorageKeys.USER_ID);
    window.location.href = "/login";
  }

  static async changePassword(payload) {
    try {
      const token = GlobalVar.getToken();
      const userID = GlobalVar.getDataByKey(StorageKeys.USER_ID);
      if (!token || !userID) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Token or User ID not found in GlobalVar",
          data: null,
          error: "Token or User ID not found in GlobalVar"
        });
      }

      const endpoint = `/api/users/change-password/${userID}?lng=en`;
      const apiResponse = await ApiProvider.putData(endpoint, payload, token);

      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error( error.message || error);
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message ,
        data: null,
        error: error.message 
      });
    }
  }
}

export default UserApi;
