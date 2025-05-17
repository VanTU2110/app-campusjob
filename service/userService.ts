import { UserResponse, verifyUserParams } from "@/types/user";
import api from "./api";

export const detailUser = async(uuid:string):Promise<UserResponse> =>{
    try {
        const response = await api.post<UserResponse>(`User/detail-user`,{uuid});
        return response.data;
        
    } catch (error) {
        console.error("Error get detail user",error);
        throw error;
    }  
}
