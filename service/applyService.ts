import api  from "./api";
import { ApplyItem, ApplyJob } from "../types/apply";
import { GetPageApplyJobParams, GetApplyJobResponse } from "../types/apply";
export const getListPageApplyJob = async (params: GetPageApplyJobParams): Promise<GetApplyJobResponse> => {
    
    const res = await api.post('/Application/get-list-by_student', params);
    return res.data;
}
export const applyJob = async (params: ApplyJob): Promise<ApplyItem> => {
  const response = await api.post('/Application/apply-job', params);
  return response.data;
}