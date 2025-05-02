
export interface Conversation {
    studentUuid: string;
    companyUuid: string;
    createdAt: string;
    uuid: string;
}
export interface ConversationListResponse {
    data: Conversation[];
    error: {
        code: string;
        message: string;
    };
}