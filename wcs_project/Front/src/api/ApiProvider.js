
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

  static async getData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE, responseType = "json") {
    try {
      const headers = {
        "Accept-Language": language,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
   
      const config = {
        params: queryParameters,
        headers: headers,
        responseType,  // เพิ่ม responseType เพื่อกำหนดรูปแบบการตอบกลับ
      };
  
      const response = await this.axiosInstance.get(endpoint, config);
      if (response.status >= 400) {
        return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
      }
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

  static async deleteData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const headers = {
        "Accept-Language": language,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
     
      const config = {
        params: queryParameters,
        headers: headers
      };
      const response = await this.axiosInstance.delete(endpoint, config);
      if (response.status >= 400) {
        return response.data; // ส่งกลับเฉพาะข้อมูล data ในกรณีที่เป็น status code 400
      }
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
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





// 2024-08-23 : ก่อนปรับ congig axios ให้ไม่เข้า try catch
// import axios from 'axios';
// import { BASE_URL, CONNECTION_TIMEOUT, DEFAULT_LANGUAGE } from '../common/constants';

// class ApiProvider {
//   static _axiosInstance;

//   static get axiosInstance() {
//     if (!this._axiosInstance) {
//       this._axiosInstance = axios.create({
//         baseURL: BASE_URL,
//         timeout: CONNECTION_TIMEOUT,
//       });
//     }
//     return this._axiosInstance;
//   }

//   static async getData(endpoint, queryParameters = {}, token = null, username = '', language = DEFAULT_LANGUAGE) {
//     try {
//       console.log("--getData--");
//       console.log("endpoint :", endpoint);
//       console.log("queryParameters :", queryParameters);
//       console.log("token :", token);
//       console.log("username :", username); // Log the username
//       console.log("language :", language);
//       const headers = {
//         'Accept-Language': language,
//       };
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       if (username) {
//         headers['username'] = username;
//       }
//       const config = {
//         params: queryParameters,
//         headers: headers
//       };
//       const response = await this.axiosInstance.get(endpoint, config);
//       return response.data;
//     } catch (error) {
//       throw new Error(`Error: ${error.message}`);
//     }
//   }

//   static async postData(endpoint, data = {}, token = null, username = '', language = DEFAULT_LANGUAGE) {
//    // try {
//       console.log("--postData--");
//       console.log("endpoint :", endpoint);
//       console.log("data :", data);
//       console.log("token :", token);
//       console.log("username :", username); // Log the username
//       console.log("language :", language);
//       const headers = {
//         'Accept-Language': language,
//       };
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       if (username) {
//         headers['username'] = username;
//       }
//       const config = {
//         headers: headers
//       };
//       const response = await this.axiosInstance.post(endpoint, data, config);
//       console.log("post Data Response", response);
//       return response.data;
//    /*  } catch (error) {
//       console.log("error", error.message);
//       throw new Error(`Error: ${error.message}`);
//     } */
//   }

//   static async putData(endpoint, payload = {}, token = null, username = '', language = DEFAULT_LANGUAGE) {
//     try {
//       console.log("--putData--");
//       console.log("endpoint :", endpoint);
//       console.log("payload :", payload);
//       console.log("token :", token);
//       console.log("username :", username); // Log the username
//       console.log("language :", language);
//       const headers = {
//         'Accept-Language': language,
//       };
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       if (username) {
//         headers['username'] = username;
//       }
//       const config = {
//         headers: headers
//       };
//       const response = await this.axiosInstance.put(endpoint, payload, config);
//       return response.data;
//     } catch (error) {
//       throw new Error(`Error: ${error.message}`);
//     }
//   }

//   static async deleteData(endpoint, queryParameters = {}, token = null, username = '', language = DEFAULT_LANGUAGE) {
//     try {
//       console.log("--deleteData--");
//       console.log("endpoint :", endpoint);
//       console.log("queryParameters :", queryParameters);
//       console.log("token :", token);
//       console.log("username :", username); // Log the username
//       console.log("language :", language);
//       const headers = {
//         'Accept-Language': language,
//       };
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       if (username) {
//         headers['username'] = username;
//       }
//       const config = {
//         params: queryParameters,
//         headers: headers
//       };
//       const response = await this.axiosInstance.delete(endpoint, config);
//       return response.data;
//     } catch (error) {
//       throw new Error(`Error: ${error.message}`);
//     }
//   }

//   // ตัวอย่างการอัปโหลดไฟล์ในเบราว์เซอร์
//   static async uploadFile(endpoint, file, token = null, username = '', language = DEFAULT_LANGUAGE) {
//     try {
//       console.log("--uploadFile--");
//       console.log("endpoint :", endpoint);
//       console.log("file :", file);
//       console.log("token :", token);
//       console.log("username :", username); // Log the username
//       console.log("language :", language);
//       const formData = new FormData();
//       formData.append('file', file);
//       const headers = {
//         ...formData.getHeaders(),
//         'Accept-Language': language,
//       };
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       if (username) {
//         headers['username'] = username;
//       }
//       const config = {
//         headers: headers
//       };
//       const response = await this.axiosInstance.post(endpoint, formData, config);
//       return response.data;
//     } catch (error) {
//       throw new Error(`Error: ${error.message}`);
//     }
//   }
// }

// export default ApiProvider;



// ก่อนปรับ เพิ่ม header -> username
/* import axios from 'axios';
import { BASE_URL, CONNECTION_TIMEOUT, DEFAULT_LANGUAGE } from '../common/constants';


class ApiProvider {
  static _axiosInstance;

  static get axiosInstance() {
    if (!this._axiosInstance) {
      this._axiosInstance = axios.create({
        baseURL: BASE_URL,
        timeout: CONNECTION_TIMEOUT,
      });
    }
    return this._axiosInstance;
  }

  static async getData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {

      console.log("--getData--");
      console.log("endpoint :",endpoint);
      console.log("queryParameters :",queryParameters);
      console.log("token :",token);
      console.log("language :",language);
      const config = {
        params: queryParameters,
        headers: {
          'Accept-Language': language,
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await this.axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async postData(endpoint, data = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const config = {
        headers: {
          'Accept-Language': language,
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await this.axiosInstance.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async putData(endpoint, payload = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const config = {
        headers: {
          'Accept-Language': language,
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await this.axiosInstance.put(endpoint, payload, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async deleteData(endpoint, queryParameters = {}, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const config = {
        params: queryParameters,
        headers: {
          'Accept-Language': language,
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await this.axiosInstance.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  // ตัวอย่างการอัปโหลดไฟล์ในเบราว์เซอร์
  static async uploadFile(endpoint, file, token = null, language = DEFAULT_LANGUAGE) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const config = {
        headers: {
          ...formData.getHeaders(),
          'Accept-Language': language,
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await this.axiosInstance.post(endpoint, formData, config);
      return response.data;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

export default ApiProvider;
 */