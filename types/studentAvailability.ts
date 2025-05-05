export interface StudentAvailability {
    uuid: string;
    studentUuid: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}
export interface StudentAvailabilityParams {
    studentUuid: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}
export interface StudentAvailabilityResponse {
    data: StudentAvailability[];
    error:{
        message: string;
        code: string;
    }
}