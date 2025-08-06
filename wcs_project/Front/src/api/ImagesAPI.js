import { GlobalVar } from '../common/GlobalVar';
import ApiProvider from './ApiProvider';
import ApiResponse from '../common/ApiResponse';

class ImagesAPI {
    static async fetchData(endpoint, method = 'GET', data = null) {
        try {
          const token = GlobalVar.getToken();
          if (!token) {
            return new ApiResponse({
              isCompleted: false,
              isError: true,
              message: 'Token not found in GlobalVar',
              data: null,
              error: 'Token not found in GlobalVar'
            });
          }
    
          const options = {
            method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
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


      static async getImageBarCodeAll(inbrm_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/images/barcode`; // API endpoint
          
          // ใช้ ApiProvider เพื่อดึง Blob
          const response = await ApiProvider.getData(endpoint, { code: String(inbrm_id) }, token, '', 'blob');
    
          if (!response) {
            throw new Error('Failed to fetch barcode. No response received.');
          }
    
          console.log("Blob size:", response.size);
    
          if (response.size === 0) {
            throw new Error('Barcode image is empty.');
          }
    
          return response; // ส่ง Blob กลับ
        } catch (error) {
          console.error("Error fetching barcode:", error.message || error);
          throw new Error(`Error: ${error.message}`);
        }
      }






}

export default ImagesAPI;