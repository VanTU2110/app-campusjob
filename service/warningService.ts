import api from "./api";
import type { ListWarningResponse, GetPageWarningParams, DetailWarningResponse } from "../types/warning";

export const getPageListWarning = async (params: GetPageWarningParams): Promise<ListWarningResponse> => {
  try {
    const response = await api.post<ListWarningResponse>(`/UserWarning/get-page-list-warning`, params);
    return response.data;
  } catch (error) {
    console.error("Error fetching warnings:", error);
    throw error;
  }
}