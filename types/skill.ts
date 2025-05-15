import { Pagination } from "./apply";
export interface Skill { 
    uuid: string;
    name: string;
}
export interface ListSkill {
    data:{
        items: Skill[];
        pagination: Pagination;
    }
    error: {
        code: string;
        message: string;
    };
}
export interface SkillListParams {
    pageSize: number;
    page: number;
    keyword?: string;
}
export interface CreateStudentSkillParams{
    studentUuid:string;
    skillUuid:string;
    proficiency:'beginner'|'intermediate'|'advanced'|'expert'

}
export interface CreateStudentSkillResponse{
    data: {
        studentUuid: string;
        skill: Skill;
        proficiency: 'beginner'|'intermediate'|'advanced'|'expert'; 
        uuid: string;
      };
      error: {
        code: string;
        message: string;
      };
    };

export interface getListStudentSkillReponse{
    data: {
        studentUuid: string;
        skill: Skill[];
        proficiency: 'beginner'|'intermediate'|'advanced'|'expert'; 
        uuid: string;
      };
      error: {
        code: string;
        message: string;
      };
    };
