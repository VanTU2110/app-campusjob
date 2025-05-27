export interface insertCVParams{
    studentUuid: string;
    cloudinaryPublicId: string;
    url: string;
    request?: string;
}
export interface CVItem {
  uuid: string;
  studentUuid: string;
  cloudinaryPublicId: string;
  url: string;
  uploadAt: string;
};