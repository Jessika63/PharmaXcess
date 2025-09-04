import api from '../api';
import {
    RegisterData,
    RegisterResponse,
    LoginData, 
    LoginResponse, 
    ForgotPasswordData,
    ForgotPasswordResponse,
    ResetPasswordData,
    ResetPasswordResponse,
    LogoutResponse
} from './Types';

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
 * Reset password
 * @param data ResetPasswordData
 * @param token string
 * @returns Promise<ResetPasswordResponse>
 */
export async function resetPassword(data: ResetPasswordData, token: string): Promise<ResetPasswordResponse> {
    console.log('Resetting password with data:', data, 'and token:', token);
    try {
        const response = await api.post<ResetPasswordResponse>('/api/auth/reset-password', data, {
            headers: {
                Authorization: `${token}`,
            },
        });
        console.log('Reset Password Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Reset Password Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * Logout user
 * @param token string
 * @returns Promise<LogoutResponse>
 */
export async function logout(token: string): Promise<LogoutResponse> {
    console.log('Logging out user with token:', token);
    try {
        const response = await api.post<LogoutResponse>('/api/auth/logout', {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Logout Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Logout Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}