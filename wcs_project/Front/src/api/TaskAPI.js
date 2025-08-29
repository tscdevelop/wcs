import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class TaskAPI {

  static async createTask(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/task/create";
      const apiResponse = await ApiProvider.postData(endpoint, payload, token);


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


}

export default TaskAPI;
