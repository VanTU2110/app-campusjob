import { ApplyItem, ApplyJob, GetApplyJobResponse, GetPageApplyJobParams,CheckApplyParams,CheckApplyResponse } from "../types/apply";
import api from "./api";
export const getListPageApplyJob = async (params: GetPageApplyJobParams): Promise<GetApplyJobResponse> => {
    
    const res = await api.post('/Application/get-list-by-student', params);
    return res.data;
}
export const applyJob = async (params: ApplyJob): Promise<ApplyItem> => {
  const response = await api.post('/Application/apply-job', params);
  return response.data;
}
export const checkApply = async (params: CheckApplyParams): Promise<CheckApplyResponse> => {
  const response = await api.post('/Application/check-applied', params);
  return response.data;
}