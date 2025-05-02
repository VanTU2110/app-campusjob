import api from "./api";
export const getListCV = async (student_Uuid: string) => {
    try {
        const response = await api.post("/CV/get-list-cv-student", { student_Uuid });
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

export const insertCV = async (CV: any) => {
    try {
        const response = await api.post("/CV/insert-cv", CV);
        return response.data
    }               
    catch (error: any) {
        throw error.response?.data?.message || "Insert CV failed"
    }
}