import { Pagination } from "./job";

export interface ApplyJob {
    studentUuid : string;
    jobUuid : string;
    coverLetter : string;
}
export interface GetPageApplyJobParams {
    page:number;
    pageSize:number;
    studentUuid:string;
}
export interface ApplyItem {
    studentUuid : string;
    jobUuid : string;
    status : string;
    coverLetter : string;
    note : string;
    applyAt: string;
    updatedAt: string;
    uuid : string;
}

export interface GetApplyJobResponse {
    data: {
        items: ApplyItem[];
        pagination: Pagination;
    };
    error: {
        code: string;
        message: string;
    };
}