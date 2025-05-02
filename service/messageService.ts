import api from './api';
import { SendMessageParams, MessageResponse,SendMessageResponse } from '@/types/message';

export const sendMessage = async (params: SendMessageParams): Promise<SendMessageResponse> => {
    try {
        const response = await api.post('Chat/send-message', params);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
export const getMessages = async (conversationUuid: string): Promise<MessageResponse> => {
    try {
        const response = await api.post('Chat/get-messages', { conversationUuid });
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}