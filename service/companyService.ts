import { CompanyDetail, getCompanyDetailParams } from "@/types/company";
import { ApiResponse } from "../types/common";
import api from "./api";

// Lấy thông tin chi tiết công ty
export const getCompanyDetail = async(CompanyUuid: string): Promise<ApiResponse<CompanyDetail>> => {
    const res = await api.post('/Companies/detail-company-by-uuid', { CompanyUuid });
    return res.data;
}
