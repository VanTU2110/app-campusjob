import { ListSkill, SkillListParams } from "@/types/skill";
import api from "./api";
export const getSkillList = async (params: SkillListParams): Promise<ListSkill> => {
    const response = await api.post<ListSkill>(`Skill/get-list-page-skill`, { params })
    return response.data;
}