import api from './api';
import { ConversationListResponse } from '../types/conversations';
export const getConversations = async (studentUuid: string): Promise<ConversationListResponse> => {
    try {
        const response = await api.post('Conversation/list-by-student', { studentUuid });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};
