import { ConversationListResponse, ConversationResponse, CreateConversationParams } from '../types/conversations';
import api from './api';
export const getConversations = async (studentUuid: string): Promise<ConversationListResponse> => {
    try {
        const response = await api.post('Conversation/list-by-student', { studentUuid });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};
export const createConversation = async (params: CreateConversationParams): Promise<ConversationResponse> => {
    try {
        const response = await api.post('Conversation/create', params);
        return response.data;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};
