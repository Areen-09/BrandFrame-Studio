import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface CreativeRequest {
    brandkit_id: string;
    user_id: string;
    prompt: string;
    aspect_ratio: string;
}

export interface CreativeResponse {
    image_url: string;
    status: string;
    description?: string;
}

export const generateCreative = async (data: CreativeRequest): Promise<CreativeResponse> => {
    try {
        const response = await axios.post(`${API_URL}/generate_creative`, data);
        return response.data;
    } catch (error) {
        console.error('Error generating creative:', error);
        throw error;
    }
};
