import { ListSkill, SkillListParams,CreateStudentSkillParams,CreateStudentSkillResponse, getListStudentSkillReponse } from "@/types/skill";
import { deleteResponse } from "@/types/deleteResponse";
import api from "./api";
export const getSkillList = async (params: SkillListParams): Promise<ListSkill> => {
    const response = await api.post<ListSkill>(`Skill/get-list-page-skill`,  params )
    return response.data;
}
export const createStudentSkill = async (params: CreateStudentSkillParams): Promise<CreateStudentSkillResponse> =>{
    try {
        const response = await api.post<CreateStudentSkillResponse>(`StudentSkill/create-student-skill`,params)
        return response.data;
    } catch (error) {
        console.error("Error creating student skill:", error);
        throw error;
    }
}
export const deleteStudentSkill = async(uuid:string):Promise<deleteResponse> =>{
    try {
        const response = await api.post<deleteResponse>(`StudentSkill/delete-studentskill`,{uuid})
        return response.data;
    } catch (error) {
        console.error("Error delete student skill",error);
        throw error;
    }
}
export const getListStudentSkill = async (studentUuid:string):Promise<getListStudentSkillReponse> =>{
    try {
        const response = await api.post<getListStudentSkillReponse>(`StudentSkill/get-list-student-skill`,{studentUuid})
        return response.data;
    } catch (error) {
        console.error("Error getting list student skill",error);
        throw error;    
    }
}