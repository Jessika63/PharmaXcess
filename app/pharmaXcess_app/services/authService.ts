import api from './api';
import { RegisterData, RegisterResponse } from './types/AuthTypes';

/**
 * Register a new user
 * @param data RegisterData
 * @returns Promise<RegisterResponse>
 */
export async function register(data: RegisterData): Promise<RegisterResponse> {
    console.log('Registering user with data:', data);
    try {
        const response = await api.post<RegisterResponse>('/api/auth/register', data);
        console.log('Register Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Register Error:', error.response?.data || error.message);
        console.log('Register Error:', error);
        return Promise.reject(error.response?.data || error.message);
    }
}
