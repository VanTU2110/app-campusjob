import api from "./api";
import { GetJobListParams, JobListResponse, JobDetailResponse, GetJobBySkillParams, GetJobByScheduleParams } from "../types/job";
export const getListPageJob = async (params: GetJobListParams):Promise<JobListResponse> => {
    const res = await api.post('/Job/get-list-page-job', params);
    return res.data;
}
export const detailJob = async (uuid: string):Promise<JobDetailResponse> => {
    const res = await api.post('/Job/detail-job', { uuid });
    return res.data;
}
export const getListPageJobBySkill = async (params: GetJobBySkillParams):Promise<JobListResponse> => {
    const res = await api.post('/Job/search-by-skill', params);
    return res.data;
}
export const getListPageJobBySchedule = async (params: GetJobByScheduleParams):Promise<JobListResponse> => {
    const res = await api.post('/Job/search-by-schedule', params);
    return res.data;
}