import api from './api';
import {
    ForgotPasswordData,
    ForgotPasswordResponse,
    LoginData, 
    LoginResponse, 
    RegisterData,
    RegisterResponse 
} from './types/AuthTypes';


/**
 * Forgot password
 * @param data ForgotPasswordData
 * @returns Promise<ForgotPasswordResponse>
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
    console.log('Requesting password reset for:', data);
    try {
        const response = await api.post<ForgotPasswordResponse>('/api/auth/forgot-password', data);
        console.log('Forgot Password Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Forgot Password Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * Login user
 * @param data LoginData
 * @returns Promise<LoginResponse>
 */
export async function login(data: LoginData): Promise<LoginResponse> {
    console.log('Logging in user with data:', data);
    try {
        const response = await api.post<LoginResponse>('/api/auth/login', data);
        console.log('Login Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Login Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

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
