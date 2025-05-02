export interface SendMessageParams {
    conversationUuid: string;
    content: string;
    senderUuid: string;
}
export interface Message {
    uuid: string;
    content: string;
    senderUuid: string;
    sendAt: string; // ISO date string
}
export interface SendMessageResponse {
    data: Message;
    error: {
        code: string;
        message: string;
    };
}
export interface MessageResponse {
    data: Message[];
    error: {
        code: string;
        message: string;
    };
}