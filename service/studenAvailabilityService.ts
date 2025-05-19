import { deleteResponse } from "@/types/deleteResponse";
import { StudentAvailabilityParams, StudentAvailabilityResponse } from "../types/studentAvailability";
import api from "./api";
export const GetListAvaibility = async(studentUuid: string):Promise<StudentAvailabilityResponse> =>{
    const res = await api.post('/StudentAvailability/get-list-vailability', { studentUuid });
    return res.data;
}
export const CreateStudentAvailability = async(params: StudentAvailabilityParams):Promise<StudentAvailabilityResponse> =>{
    const res = await api.post('/StudentAvailability/insert-availability', params);
    return res.data;
}
export const deleteAvailability = async (availabilityUuid: string):Promise<deleteResponse> => {
    console.log("Sending delete request for:", availabilityUuid);
    try {
      const res = await api.post<deleteResponse>('/StudentAvailability/delete-availability', { 
        uuid: availabilityUuid // Đảm bảo payload rõ ràng
      });
      return res.data;
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  };