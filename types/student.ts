import { Location } from "./location";
import { Skill } from "./job";

export interface Availability {
    uuid: string;
    studentUuid: string;
    dayOfWeek: string; // e.g., "Monday", "Tuesday"
    startTime: string; // e.g., "08:00"
    endTime: string;   // e.g., "12:00"
  }
  export interface StudentSkill {
    uuid: string;
    student_Uuid: string;
    skill: Skill;
    proficiency: string; // e.g., "Beginner", "Intermediate", "Advanced"
  }
  export interface StudentDetail {
    uuid: string;
    userUuid: string;
    fullname: string;
    phoneNumber: string;
    gender: number; // e.g., 0 for male, 1 for female, etc.
    birthday: string; // ISO 8601 date string
    university: string;
    major: string;
    tp: Location; // Province/City
    qh: Location; // District
    xa: Location; // Ward
    availabilities: Availability[];
    listSkill: StudentSkill[];
  }
  export interface DetailStudentResponse {
    error: {
      code: string; // e.g., "success", "error"
      message: string;
    };
    data: StudentDetail;
  }
  export interface InsertStudent {
    userUuid: string;
    fullname: string;
    phoneNumber: string;
    gender: number
    birthday: string; // ISO 8601 date string
    university: string;
    major: string;
    matp: string; // Province/City code
    maqh: string; // District code
    xaid: string; // Ward code
  }
