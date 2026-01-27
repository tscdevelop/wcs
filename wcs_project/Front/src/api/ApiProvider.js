
// 2024-08-23 : ปรับ congig axios ให้ไม่เข้า try catch
import axios from "axios";
import { BASE_URL, CONNECTION_TIMEOUT, DEFAULT_LANGUAGE } from "../common/constants";

class ApiProvider {
  static _axiosInstance;

  static get axiosInstance() {
    if (!this._axiosInstance) {
      this._axiosInstance = axios.create({
        baseURL: BASE_URL,
        timeout: CONNECTION_TIMEOUT,
        validateStatus: function (status) {
          return status >= 200 && status <= 500; // ถือว่า status code 200-499 เป็น success
        },
      });
    }
    return this._axiosInstance;
  }

  // static async getData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE, responseType = "json") {
  //   try {
  //     const headers = {
  //       "Accept-Language": language,
  //     };
  //     if (token) {
  //       headers["Authorization"] = `Bearer ${token}`;
  //     }
   
  //     const config = {
  //       params: queryParameters,
  //       headers: headers,
  //       responseType,  // เพิ่ม responseType เพื่อกำหนดรูปแบบการตอบกลับ
  //     };
  
  //     const response = await this.axiosInstance.get(endpoint, config);
  //     if (response.status >= 400) {
  //       return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
  //     }
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(`Error: ${error.message}`);
  //   }
  // }
  
  //version รองรับ authenticateWCS
  static async getData(
    endpoint,
    queryParameters = {},
    token = null,
    language = DEFAULT_LANGUAGE,
    responseType = "json",
    extraHeaders = {} // 👈 เพิ่มตรงนี้
  ) {
    try {
      const headers = {
        "Accept-Language": language,
        ...extraHeaders, // 👈 merge headers เพิ่ม
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config = {
        params: queryParameters,
        headers,
        responseType,
      };

      const response = await this.axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }


  static async postData(endpoint, data = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const headers = {
        "Accept-Language": language,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
     
      const config = {
        headers: headers
      };
      const response = await this.axiosInstance.post(endpoint, data, config);
      if (response.status >= 400) {
        return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async putData(endpoint, payload = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const headers = {
        "Accept-Language": language,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const config = {
        headers: headers
      };
      const response = await this.axiosInstance.put(endpoint, payload, config);
      if (response.status >= 400) {
        return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  // static async deleteData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE) {
  //   try {
  //     const headers = {
  //       "Accept-Language": language,
  //     };
  //     if (token) {
  //       headers["Authorization"] = `Bearer ${token}`;
  //     }
     
  //     const config = {
  //       params: queryParameters,
  //       headers: headers
  //     };
  //     const response = await this.axiosInstance.delete(endpoint, config);
  //     if (response.status >= 400) {
  //       return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
  //     }
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(`Error: ${error.message}`);
  //   }
  // }

  static async deleteData(
  endpoint,
  payload = {},
  token = null,
  language = DEFAULT_LANGUAGE,
  options = { useBody: false }
) {
  const headers = {
    "Accept-Language": language,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { headers };

  if (options.useBody) {
    config.data = payload;   // ส่ง body
  } else {
    config.params = payload; // ส่ง query
  }

  const response = await this.axiosInstance.delete(endpoint, config);
  return response.data;
}


  static async uploadFile(endpoint, file, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const headers = {
        "Accept-Language": language,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
     
      const config = {
        headers: headers
      };
      const response = await this.axiosInstance.post(endpoint, formData, config);
      if (response.status >= 400) {
        return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

export default ApiProvider;