import { Platform } from "react-native";
import api from "./api";
export interface UploadResponse {
    fileUrl: {
        publicId: string;
        url: string;
    }
}

export const uploadFile = async (file: any) => {
    try {
        console.log("Uploading file:", file); // Debug log
        
        const formData = new FormData();
        // Ensure file is properly formatted for multipart/form-data request
        // The property name 'file' must match exactly what the API expects
        formData.append("file", {
            uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
            name: file.name,
            type: file.mimeType || "application/octet-stream",
        } as any);
        
        // Debug log to verify FormData structure
        console.log("FormData created:", JSON.stringify(formData));
        
        const response = await api.post("/upload/file", formData, {
            headers: { 
                "Content-Type": "multipart/form-data",
                "Accept": "application/json"
            },
            transformRequest: (data, headers) => {
                // Return the FormData instance directly
                return formData;
            },
        });
        console.log("Upload response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Upload error:", error.response || error);
        if (error.response?.data) {
            console.error("Error details:", error.response.data);
        }
        throw error.response?.data?.message || "Upload file failed";
    }
};
