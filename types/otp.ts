export interface OPTResponse {
    message: string,
    opt:{
        id:number;
        exception: string;
        status: string;
        isCanceled:boolean;
        isCompleted: boolean;
        isCompletedSuccessfully:boolean;
        creationOptions:string;
        asyncState:string;
        isFaulted:boolean;
    }
}