import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class WaitingAPI {
    static async createWaiting(payload) {
        try {
        const token = GlobalVar.getToken();
        const endpoint = "/api/waiting/create";
        const apiResponse = await ApiProvider.postData(endpoint, payload, token);
        return new ApiResponse({
            isCompleted: true,
            isError: false,
            message: "Success",
            data: apiResponse,
            error: null
        });

        } catch (error) {
        console.error("Error search Waiting:", error.message || error);
        throw new Error(`Error: ${error.message}`);

        }
    }

    static async updateWaiting(waiting_id,formData) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/waiting/update/${waiting_id}`;
            
            // ทำการเรียก API ด้วย token และ endpoint
            const response = await ApiProvider.putData(endpoint, formData, token);
            console.log("update API Response:", response);
            
            return response; // ส่งค่ากลับไป
        } catch (error) {
            console.error("Error in Waiting:", error);
            throw error;
        }
    }

    static async deleteWaiting(waiting_id) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/waiting/delete/${waiting_id}`;
            
            // ทำการเรียก API ด้วย token และ endpoint
            const response = await ApiProvider.deleteData(endpoint, {}, token);
            console.log("API Response:", response);
            
            return response; // ส่งค่ากลับไป
        } catch (error) {
            console.error("Error in Waiting:", error);
            throw error;
        }
    }


    static async WaitingAll() {
        try {
        const token = GlobalVar.getToken();
        const endpoint = "/api/waiting/get-all";
        const apiResponse = await ApiProvider.getData(endpoint, {}, token);

        return new ApiResponse({
            isCompleted: true,
            isError: false,
            message: "Success",
            data: apiResponse,
            error: null
        });

        } catch (error) {
        console.error("Error search Waiting:", error.message || error);
        throw new Error(`Error: ${error.message}`);

        }
    }

    static async WaitingUsageAll() {
        try {
        const token = GlobalVar.getToken();
        const endpoint = "/api/waiting/get-usage-all";
        const apiResponse = await ApiProvider.getData(endpoint, {}, token);
        return new ApiResponse({
            isCompleted: true,
            isError: false,
            message: "Success",
            data: apiResponse,
            error: null
        });

        } catch (error) {
        console.error("Error search Waiting:", error.message || error);
        throw new Error(`Error: ${error.message}`);

        }
    }

    static async getUsageByID(waiting_id) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/waiting/get-usage-by-id/${waiting_id}`;
            
            // ทำการเรียก API ด้วย token และ endpoint
            const response = await ApiProvider.getData(endpoint, {}, token);
            console.log("API Response:", response);
            
            return response; // ส่งค่ากลับไป
        } catch (error) {
            console.error("Error in Waiting:", error);
            throw error;
        }
    }

    static async WaitingReceiptAll() {
        try {
        const token = GlobalVar.getToken();
        const endpoint = "/api/waiting/get-receipt-all";
        const apiResponse = await ApiProvider.getData(endpoint, {}, token);
        return new ApiResponse({
            isCompleted: true,
            isError: false,
            message: "Success",
            data: apiResponse,
            error: null
        });

        } catch (error) {
        console.error("Error search Waiting:", error.message || error);
        throw new Error(`Error: ${error.message}`);

        }
    }

    static async getReceiptByID(waiting_id) {
        try {
            const token = GlobalVar.getToken();
            const endpoint = `/api/waiting/get-receipt-by-id/${waiting_id}`;
            
            // ทำการเรียก API ด้วย token และ endpoint
            const response = await ApiProvider.getData(endpoint, {}, token);
            console.log("API Response:", response);
            
            return response; // ส่งค่ากลับไป
        } catch (error) {
            console.error("Error in Waiting:", error);
            throw error;
        }
    }

}

export default WaitingAPI;