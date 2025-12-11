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

/**
 * Convert a Firebase Storage URL to use the backend proxy for CORS-free loading
 */
export const getProxiedImageUrl = (url: string): string => {
    // Only proxy Firebase Storage URLs
    if (url.includes('firebasestorage.googleapis.com')) {
        return `${API_URL}/proxy_image?url=${encodeURIComponent(url)}`;
    }
    return url;
};


// Template Types
export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    category: string;
}

export interface TemplateListResponse {
    templates: TemplateInfo[];
}

export interface TemplateGenerationRequest {
    user_id: string;
    brandkit_id: string;
    template_id: string;
}

export interface CanvasFormat {
    objects: any[];
    background?: string;
    width?: number;
    height?: number;
}

export interface TemplateGenerationResponse {
    status: string;
    formats: {
        facebook?: CanvasFormat;
        instagram?: CanvasFormat;
        story?: CanvasFormat;
    };
    message: string;
}

/**
 * Fetch list of available templates
 */
export const getTemplates = async (): Promise<TemplateInfo[]> => {
    try {
        const response = await axios.get<TemplateListResponse>(`${API_URL}/templates`);
        return response.data.templates;
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
};

/**
 * Generate a poster from a template
 */
export const generateFromTemplate = async (
    data: TemplateGenerationRequest
): Promise<TemplateGenerationResponse> => {
    try {
        const response = await axios.post<TemplateGenerationResponse>(
            `${API_URL}/generate_from_template`,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error generating from template:', error);
        throw error;
    }
};


// Product Poster Types
export interface ProductPosterRequest {
    user_id: string;
    brandkit_id: string;
    product_name: string;
    product_description?: string;
    poster_type: string;
    poster_description?: string;
    product_image_data?: string;  // Base64 data URL
    tagline?: string;
}

export interface ProductPosterResponse {
    status: string;
    formats: {
        facebook?: CanvasFormat;
        instagram?: CanvasFormat;
        story?: CanvasFormat;
    };
    message: string;
}

/**
 * Generate a product poster using AI-designed layouts
 */
export const generateProductPoster = async (
    data: ProductPosterRequest
): Promise<ProductPosterResponse> => {
    try {
        const response = await axios.post<ProductPosterResponse>(
            `${API_URL}/generate_product_poster`,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error generating product poster:', error);
        throw error;
    }
};


// Remove Background Types
export interface RemoveBackgroundRequest {
    image_data: string;  // Base64 encoded image data URL
}

export interface RemoveBackgroundResponse {
    status: string;
    image_data: string;  // Base64 encoded image with transparent background
    message?: string;
}

/**
 * Remove background from an image using AI
 */
export const removeBackground = async (
    data: RemoveBackgroundRequest
): Promise<RemoveBackgroundResponse> => {
    try {
        const response = await axios.post<RemoveBackgroundResponse>(
            `${API_URL}/remove_background`,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
};
