

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
    status : 'cancelled' | 'pending' | 'approved' | 'rejected';
    coverLetter : string;
    note : string;
    appliedAt: string;
    updatedAt: string;
    uuid : string;
}
export interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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
export interface CheckApplyParams {
    studentUuid: string;
    jobUuid: string;
}
export interface CheckApplyResponse {
    data: boolean;
    error: {
        code: string;
        message: string;
    };
}