import api from "./api";

export const uploadFile = async (file: any) => {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
        } as any);
        const response = await api.post("/upload/file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error:any) {
        throw error.response?.data?.message || "Upload file failed";
    }
}