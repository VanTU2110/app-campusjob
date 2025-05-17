import type { OPTResponse } from "../types/otp";
import api from "./api";

export const sendOTP = async (email:string):Promise<OPTResponse> => {
    try {
        const response = await api.post<OPTResponse>(`OTP/send`,{email});
        return response.data;
    } catch (error) {
        console.error("Error send OTP",error);
        throw error;
    }
}