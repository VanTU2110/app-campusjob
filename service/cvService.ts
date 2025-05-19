import { insertCVParams } from "@/types/cv";
import api from "./api";
export const getListCV = async (studentUuid: string) => {
    try {
        const response = await api.post("/CV/get-list-cv-student", { studentUuid });
        return response.data
    } catch (error: any) {
        throw error.response?.data?.message || "Get list CV failed"
    }
}

export const getCVDetail = async (uuid: string) => {
    try {
        const response = await api.post("/CV/get-detail-cv", { uuid });
        return response.data
    } catch (error: any) {
        throw error.response?.data?.message || "Get CV detail failed"
    }
}

export const insertCV = async (params: insertCVParams) => {
    try {
        // Make sure we're sending exactly what the API expects
        const requestBody = {
            studentUuid: params.studentUuid,
            cloudinaryPublicId: params.cloudinaryPublicId,
            url: params.url,
            request: params.request || "CV upload" // Provide a default if not specified
        };
        
        console.log("Sending to insert-cv API:", JSON.stringify(requestBody));
        const response = await api.post("/CV/insert-cv", requestBody);
        return response.data;
    } catch (error: any) {
        console.error("Insert CV error:", error.response?.data);
        throw error.response?.data?.message || "Insert CV failed";
    }
};