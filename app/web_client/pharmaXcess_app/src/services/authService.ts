/**
 * Auth Service
 * 
 * Provides authentication-related API calls using the configured Axios instance.
 * 
 * Exposed Functions:
 * - login: Authenticates a user with email and password.
 * - logout: Logs out the current user.
 * - signUp: Registers a new user with email and password.
 */

import api from './api';

/**
 * Logs in a user with the provided credentials.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} The API response data if successful.
 * @throws Will return a rejected promise if the request fails.
 */
export async function login(email: string, password: string) {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * Logs out the current user.
 * 
 * @returns {Promise<any>} The API response data if successful.
 * @throws Will return a rejected promise if the request fails.
 */
export async function logout() {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * Registers a new user with the provided credentials.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} The API response data if successful.
 * @throws Will return a rejected promise if the request fails.
 */
export const signUp = async (email: string, password: string) => {
    try {
        const response = await api.post('/auth/signup', { email, password });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
};