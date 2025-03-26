import api from "./api"

export const getStudentProfile = async(uuid:string) => {
    try {
        const response = await api.post("/Student/detail-student",{uuid})
        return response.data
    } catch (error: any) {
        throw error.response?.data?.message || "Get profile failed!"
    }
} 
export const insertStudentProfile = async(studentInfo:any) => {
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