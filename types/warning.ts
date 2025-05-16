export interface Warning {
    uuid: string;
    targetType : string;
    targetUuid : string;
    messages : string;
    createdAt : string;
}
export interface ListWarningResponse {
    error: {
        code: string;
        message: string;
    };
    data:{
        items: Warning[];
        pagination: {
            page: number;
            pageSize: number;
        }
    }
}
export interface GetPageWarningParams {
    page: number;
    pageSize: number;
    targetUuid: string;
}
export interface DetailWarningResponse {
    error: {
        code: string;
        message: string;
    };
    data: Warning;
}