import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class AisleAPI {

  static async AisleAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/aisle/get-all";
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);


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

    static async AisleDropdown() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/aisle/get-code-dropdown";
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);


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

export default AisleAPI;
