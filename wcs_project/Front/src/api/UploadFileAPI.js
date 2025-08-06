import { GlobalVar } from '../common/GlobalVar';
import ApiProvider from './ApiProvider';
import ApiResponse from '../common/ApiResponse';
import { Language } from '@mui/icons-material';

class UploadFileAPI {
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



      static async downloadFile(directory, subfolder, file_name) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/files/download/${directory}/${subfolder}/${file_name}`;
            console.log('Calling API endpoint:', endpoint);
    
            // ใช้ getData ของ ApiProvider เพื่อรับข้อมูลเป็น Blob
            const response = await ApiProvider.getData(endpoint, {}, token, '', 'blob');
    
            if (!response) {
                throw new Error('Failed to download file. No response received.');
            }
    
            console.log("Blob size:", response.size);
    
            if (response.size === 0) {
                throw new Error('Downloaded file is empty');
            }
    
            // สร้าง URL สำหรับ Blob และสร้างลิงก์ดาวน์โหลด
            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file_name || 'downloaded-file.pdf'); // ตั้งชื่อไฟล์
    
            document.body.appendChild(link);
            link.click();
            
            // ลบลิงก์ออกจาก DOM และยกเลิก URL ของ Blob
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
    
            console.log("File download initiated successfully.");
        } catch (error) {
            console.error("Error downloading file:", error.message || error);
            throw new Error(`Error: ${error.message}`);
        }
    }
    
    
    
    
    
    

    static async uploadFile(directory, subfolder, formData) {
      try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/files/upload/${directory}/${subfolder}`;
          const apiResponse = await ApiProvider.postData(endpoint, formData, token);
          console.log("API Response:", apiResponse);
          return apiResponse;
      } catch (error) {
          console.error("Error fetching upload:", error.message || error);
          throw new Error(`Error: ${error.message}`);
      }
  }
  
  





    
//   static async downloadFile(directory, subfolder, file_name) {
//     try {
//         const token = GlobalVar.getToken();
//         const endpoint = `/api/files/download/${directory}/${subfolder}/${file_name}`;
        
//         // Log all parameters and headers before making the request
//         console.log('Download File - Detailed Debug Log');
//         console.log('-----------------------------------');
//         console.log('API Endpoint:', endpoint);
//         console.log('Parameters:', {
//             directory,
//             subfolder,
//             file_name
//         });
//         console.log('Headers:', {
//             Authorization: `Bearer ${token}`
//         });
        
//         const response = await fetch(endpoint, {
//             method: 'GET',
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });

//         // Log the response status and headers
//         console.log('Response Status:', response.status);
//         console.log('Response Headers:', Array.from(response.headers.entries()));

//         // Check status and Content-Type before processing the response
//         if (!response.ok) {
//             throw new Error(`Failed to download file. Status: ${response.status}`);
//         }

//         const contentType = response.headers.get("Content-Type");
//         if (contentType === "text/html") {
//             console.warn("Received unexpected content type:", contentType);
//             throw new Error('Unexpected content type. File may not exist or access is denied.');
//         }

//         // Process the file data as an array buffer
//         const arrayBuffer = await response.arrayBuffer();
        
//         // Convert the array buffer to a binary string
//         const byteArray = new Uint8Array(arrayBuffer);
//         const binaryString = byteArray.reduce((data, byte) => data + String.fromCharCode(byte), '');

//         // Create a data URL from the binary string
//         const downloadUrl = `data:${contentType};base64,${btoa(binaryString)}`;

//         // Log download URL creation for debugging
//         console.log('Download URL:', downloadUrl);
        
//         const a = document.createElement('a');
//         a.href = downloadUrl;
//         a.download = file_name; // Set the desired download filename
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
        
//         console.log('File download completed.');

//     } catch (error) {
//         console.error("Error downloading file:", error.message || error);
//         throw new Error(`Error: ${error.message}`);
//     }
// }



  
  

  
  
  
  

    static async getUploadfile(directory, subfolder) {
      try {
          const token = GlobalVar.getToken(); // ตรวจสอบ token
          const endpoint = `/api/files/get-files-list/${directory}/${subfolder}`;
          console.log('Calling API endpoint:', endpoint); // แสดง endpoint ที่เรียก
          const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API
          console.log("apiResponse : ", apiResponse); // แสดงผลลัพธ์ API
          return apiResponse; // คืนค่าผลลัพธ์
      } catch (error) {
          console.error("Error downloading file:", error.message || error);
          throw new Error(`Error: ${error.message}`); // แสดงข้อผิดพลาด
      }
  }
    
  // ใน UploadFileAPI
static async deleteUploadfile(directory, subfolder, file_name) {
    try {
        const token = GlobalVar.getToken(); // ตรวจสอบ token
        const endpoint = `/api/files/delete/${directory}/${subfolder}/${file_name}`;
        console.log('Calling DELETE API endpoint:', endpoint); // แสดง endpoint ที่เรียก

        // เรียก API โดยใช้ method DELETE ผ่าน ApiProvider.deleteData
        const response = await ApiProvider.deleteData(endpoint, {}, token);
        
        // ตรวจสอบว่าการลบสำเร็จหรือไม่ (เช็คจากสถานะ response หรือค่า response)
        if (response.status === 200 || response.success) {
            console.log("File deleted successfully:", response);
            return true; // ส่งคืน true เมื่อการลบสำเร็จ
        } else {
            console.warn("File deletion failed:", response);
            return false;
        }
    } catch (error) {
        console.error("Error deleting file:", error.message || error);
        throw new Error(`Error: ${error.message}`); // แสดงข้อผิดพลาด
    }
}


      


}
export default UploadFileAPI;