import api from "./api";
import { CreateReportParams, ReportResponse } from "@/types/report";

export const createReport = async (params: CreateReportParams): Promise<ReportResponse> => {
    const response = await api.post<ReportResponse>(`Report/create-report`, params);
    return response.data;
}