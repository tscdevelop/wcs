import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class LocationsAPI {
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
    
    static async searchLocations({ loc = "", box_loc = "" }) {
        try {
            const token = GlobalVar.getToken();
            const language = GlobalVar.getLanguage() || "en";

            // 🔥 แปลง "" → undefined
            const filters = {
                loc: loc?.trim() || undefined,
                box_loc: box_loc?.trim() || undefined,
                lng: language,
            };
            
            const apiResponse = await ApiProvider.getData(
            "/api/locations/search-location",
            filters,  // <-- ApiProvider จะประกอบ query string ให้เอง
            token,
            language
            );

            //console.log("apiResponse:", apiResponse);
            return apiResponse;

        } catch (error) {
            console.error("Error search:", error.message || error);
            throw new Error(`Error: ${error.message}`);
        }
    }


}

export default LocationsAPI;