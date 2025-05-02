import api from "./api";
import { GetJobListParams, JobListResponse, JobDetailResponse } from "../types/job";
export const getListPageJob = async (params: GetJobListParams):Promise<JobListResponse> => {
    const res = await api.post('/Job/get-list-page-job', params);
    return res.data;
}
export const detailJob = async (uuid: string):Promise<JobDetailResponse> => {
    const res = await api.post('/Job/detail-job', { uuid });
    return res.data;
}