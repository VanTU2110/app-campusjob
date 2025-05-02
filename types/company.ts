import { Location } from "./location";
export interface CompanyDetail {
    userUuid: string;
    uuid: string;
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    tp: Location; // Thành phố
    qh: Location; // Quận/huyện
    xa: Location; // Xã/phường
  }
  export interface getCompanyDetailParams {
companyUuid: string; }