import {StudentAvailability,StudentAvailabilityParams,StudentAvailabilityResponse} from "../types/studentAvailability";
import api from "./api";
export const GetListAvaibility = async(studentUuid: string):Promise<StudentAvailabilityResponse> =>{
    const res = await api.post('/StudentAvailability/get-list-vailability', { studentUuid });
    return res.data;
}
export const CreateStudentAvailability = async(params: StudentAvailabilityParams):Promise<StudentAvailabilityResponse> =>{
    const res = await api.post('/StudentAvailability/insert-availability', params);
    return res.data;
}