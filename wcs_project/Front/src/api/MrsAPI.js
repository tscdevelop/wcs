import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class MrsAPI {

  static async MRSAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/mrs/get-all";
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

export default MrsAPI;
