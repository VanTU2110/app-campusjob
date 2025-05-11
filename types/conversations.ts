
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
export interface CreateConversationParams {
    studentUuid: string;
    companyUuid: string;
}
export interface CreateConversationResponse {
    data: Conversation;
    error: {
        code: string;
        message: string;
    };
}
export interface ConversationResponse {
    data: Conversation;
    error: {
        code: string;
        message: string;
    };
}