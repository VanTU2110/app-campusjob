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

