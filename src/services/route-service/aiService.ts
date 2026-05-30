import { axiosInstance } from '../../configurations/axios';

export interface AiChatRequest {
  prompt: string;
}

export interface AiChatResponse {
  suggestion: string;
}

const AI_BASE = '/ai';

export const aiService = {
  getSuggestion(request: AiChatRequest) {
    return axiosInstance.post<AiChatResponse>(`${AI_BASE}/suggest`, request);
  },
  getAdminSuggestion(request: AiChatRequest) {
    return axiosInstance.post<AiChatResponse>(`${AI_BASE}/admin-suggest`, request);
  },
};
