import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class TaskAPI {

  //สั่งให้ task ทำงาน
  static async createTask(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/tasks/create";
      const apiResponse = await ApiProvider.postData(endpoint, payload, token);


      return new ApiResponse({
        isCompleted: true,
        isError: false,
        message: "Success",
        data: apiResponse,
        error: null
      });

    } catch (error) {
      console.error("Error search Task:", error.message || error);
      throw new Error(`Error: ${error.message}`);

    }
  }

  static async confirm(taskId) {
      try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/tasks/confirm/${taskId}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.postData(endpoint, {}, token);
          console.log("confirm order API Response:", response);
          
          return response; // ส่งค่ากลับไป
      } catch (error) {
          console.error("Error in Task:", error);
          throw error;
      }
  }

  static async deleteTask(task_id) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/tasks/delete/${task_id}`;
            
            // ทำการเรียก API ด้วย token และ endpoint
            const response = await ApiProvider.deleteData(endpoint, {}, token);
            console.log("API Response:", response);
            
            return response; // ส่งค่ากลับไป
        } catch (error) {
            console.error("Error in Task:", error);
            throw error;
        }
    }

  static async TaskAll() {
      try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/tasks/get-all";
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      return new ApiResponse({
          isCompleted: true,
          isError: false,
          message: "Success",
          data: apiResponse,
          error: null
      });

      } catch (error) {
      console.error("Error search Task:", error.message || error);
      throw new Error(`Error: ${error.message}`);

      }
  }


}

export default TaskAPI;
