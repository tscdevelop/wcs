import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";


class RoleAPI {
  static async fetchData(endpoint, method = "GET", data = null) {
    try {
      const token = GlobalVar.getToken();
      if (!token) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Token not found in GlobalVar",
          data: null,
          error: "Token not found in GlobalVar"
        });
      }

      const options = {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: data ? JSON.stringify(data) : null
      };

      const apiResponse = await ApiProvider.request(endpoint, options);
      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error(`Error ${method} request to ${endpoint}:`, error.response ? error.response.data : error.message || error);
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message || `Error ${method} request to ${endpoint}`,
        data: null,
        error: error.message || `Error ${method} request to ${endpoint}`
      });
    }
  }


  static async searchRole() {
    try {
      const token = GlobalVar.getToken();

      const endpoint = "/api/roles/search";
      
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
      console.log("apiResponse : ", apiResponse);

      return new ApiResponse({
        isCompleted: true,
        isError: false,
        message: "Success",
        data: apiResponse,
        error: null
      });

      


    } catch (error) {
      console.error("Error search Role:", error.message || error);
      throw new Error(`Error: ${error.message}`);

    }
  }
  static async checkRole(role_code) {
    try {
      const token = GlobalVar.getToken();


      // ส่ง role_code เป็น query parameter ใน URL
      const endpoint = `/api/roles/check-role-code?role_code=${role_code}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
      console.log("apiResponse : ", apiResponse);

      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error("Error Check Role:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }


  static async getByRoleCode(role_code) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

      const endpoint = `/api/roles/get/${role_code}`; // กำหนด endpoint สำหรับเรียก API
      console.log("Request Endpoint:", endpoint);
      const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูลพนักงาน

      if (!apiResponse || typeof apiResponse !== "object") {
        console.error("Invalid API Response:", apiResponse);
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Invalid API response",
          data: null,
          error: "Invalid API response"
        });
      }

      const response = new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

      return response;

    } catch (error) {
      console.error("Error get Role Code:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }



  // static async getPermissionByMenu(role_code) {
  //   try {
  //     const token = GlobalVar.getToken();
  //     console.log('Token:', token);  // ตรวจสอบ token ที่ได้

  //     const role = GlobalVar.getRole();
  //     console.log('Role:', role);

  //     const endpoint = `/api/roles/getMenuPermission/${role_code}`;
  //     console.log('Request Endpoint:', endpoint);  // ตรวจสอบ URL ที่จะใช้เรียก API

  //     const apiResponse = await ApiProvider.getData(endpoint, {}, token);
  //     console.log('API Response:', apiResponse);  // ตรวจสอบ response ที่ได้จาก API

  //     if (!apiResponse || typeof apiResponse !== 'object') {
  //       console.error('Invalid API Response:', apiResponse);
  //       return new ApiResponse({
  //         isCompleted: false,
  //         isError: true,
  //         message: 'Invalid API response',
  //         data: null,
  //         error: 'Invalid API response'
  //       });
  //     }

  //     const response = new ApiResponse({
  //       isCompleted: apiResponse.isCompleted,
  //       isError: apiResponse.isError,
  //       message: apiResponse.message,
  //       data: apiResponse.data,
  //       error: apiResponse.error
  //     });

  //     return response;

  //   } catch (error) {
  //     console.error("Error get Permission By Menu:", error.message || error);
  //     throw new Error(`Error: ${error.message}`);
  //   }
  // }



  static async getPermissionByMenu() {
    try {
      // ดึง token และ role จาก LocalStorage ผ่าน GlobalVar
      const token = GlobalVar.getToken();
      const role_code = GlobalVar.getRole();  // ดึง role_code จาก GlobalVar

      if (!role_code) {
        console.error("Role code not found");
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Role code not found",
          data: null,
          error: "Role code not found"
        });
      }

      const endpoint = `/api/roles/getMenuPermission/${role_code}`;

      // เรียก API โดยส่ง token ไปใน header
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
   

      // ตรวจสอบ response ที่ได้ว่าถูกต้องหรือไม่
      if (!apiResponse || typeof apiResponse !== "object") {
        console.error("Invalid API Response:", apiResponse);
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Invalid API response",
          data: null,
          error: "Invalid API response"
        });
      }

      // สร้าง response ใหม่จากข้อมูลที่ได้จาก API
      const response = new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

      return response;

    } catch (error) {
      console.error("Error get Permission By Menu:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }



  static async createRole(form) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

      const endpoint = "/api/roles/create"; // API endpoint


      const apiResponse = await ApiProvider.postData(endpoint, form, token); // ส่งคำขอ POST

      // ตรวจสอบ response ที่ได้รับจาก API
      console.log("API Response:", apiResponse);

      if (!apiResponse || apiResponse.isError) {
        console.error("Error response from API:", apiResponse);
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: apiResponse.message ,
          data: null,
          error: apiResponse.error
        });
      }

      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error("Error Create Role:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async updateRole(roleCode, form) {
    try {
      const token = GlobalVar.getToken(); // Ensure token retrieval

      // ตรวจสอบว่าคุณมี URL ที่ถูกต้อง และใช้ Path Parameter ถูกต้อง
      const endpoint = `/api/roles/update/${roleCode}`; // หรือ "/api/roles/edit/:role_code" ถ้าถูกต้อง
      const apiResponse = await ApiProvider.putData(endpoint, form, token); // Sending PUT request

      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error("Error update Role:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }




  static async deleteRole(role_code) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
      // const username = GlobalVar.getUsername(); // ดึง username จาก GlobalVar
      // if (!token) {
      //   return new ApiResponse({
      //     isCompleted: false,
      //     isError: true,
      //     message: 'Token not found in GlobalVar',
      //     data: null,
      //     error: 'Token not found in GlobalVar'
      //   });
      // }

      const endpoint = `/api/roles/delete/${role_code}`; // กำหนด endpoint สำหรับเรียก API
      const apiResponse = await ApiProvider.deleteData(endpoint, {}, token); // เรียก API เพื่อทำการลบข้อมูลพนักงาน

      // return new ApiResponse({
      //   isCompleted: apiResponse.isCompleted,
      //   isError: apiResponse.isError,
      //   message: apiResponse.message,
      //   data: apiResponse.data,
      //   error: apiResponse.error
      // });
      return apiResponse;
    } catch (error) {

      console.error("Error creating customer and pet:", error.message || error);
      throw new Error(`Error: ${error.message}`);
      // return new ApiResponse({
      //   isCompleted: false,
      //   isError: true,
      //   message: error.message || 'Error deleting employee',
      //   data: null,
      //   error: error.message || 'Error deleting employee'
      // });
    }
  }

  static async getPermissionAction(menu_id) {
    try {
      // ดึง token และ role จาก LocalStorage ผ่าน GlobalVar
      const token = GlobalVar.getToken();
      const role_code = GlobalVar.getRole();  // ดึง role_code จาก GlobalVar

/* 
      if (!role_code) {
        console.error('Role code not found');
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: 'Role code not found',
          data: null,
          error: 'Role code not found'
        });
      } */

      const endpoint = `/api/roles/getPermissionAction/${role_code}/${menu_id}`;

      // เรียก API โดยส่ง token ไปใน header
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
     

      /* // ตรวจสอบ response ที่ได้ว่าถูกต้องหรือไม่
      if (!apiResponse || typeof apiResponse !== 'object') {
        console.error('Invalid API Response:', apiResponse);
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: 'Invalid API response',
          data: null,
          error: 'Invalid API response'
        });
      }

      // สร้าง response ใหม่จากข้อมูลที่ได้จาก API
      const response = new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      }); */

      return apiResponse;

    } catch (error) {
      console.error("Error get Permission By Menu:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }




  static async getPermisBranchRoleDrop(role_code) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

      const endpoint = `/api/dropdown/get-role-permission-branch-dropdown/${role_code}`; // กำหนด endpoint สำหรับเรียก API
      const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูลพนักงาน


      return apiResponse;

    } catch (error) {
      console.error("Error get Role Code:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }



  


}

export default RoleAPI;