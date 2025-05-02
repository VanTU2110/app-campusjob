import api from "./api"
import { DetailStudentResponse,InsertStudent, StudentDetail } from "../types/student";

export const getStudentProfile = async (uuid: string): Promise<DetailStudentResponse> => {
    try{
    const res = await api.post('/Student/detail-student', { uuid });
    return res.data;
    } catch (error: any) {
        throw error.response?.data?.message || "Get profile failed!"
    }
} 
export const insertStudentProfile = async(studentInfo:InsertStudent):Promise<StudentDetail> => {
    try {
        const response = await api.post("/Student/create-student",studentInfo)
        return response.data
    } catch (error:any) {
        throw error.response?.data?.message || "Insert profile failed"
    }
}

export const updateStudentProfile = async(studentInfo:any) => {
    try {
        const response = await api.post("/Student/update-student",studentInfo)
        return response.data
    } catch (error : any) {
        throw error.response?.data?.message || "Update profile failed"
    }
}