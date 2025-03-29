import api from './api';

export async function login(email: string, password: string) {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function logout() {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export const signUp = async (email: string, password: string) => {
    try {
        const response = await api.post('/auth/signup', { email, password });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
};