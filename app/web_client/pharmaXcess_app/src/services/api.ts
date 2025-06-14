/**
 * API Service
 * 
 * Configures and exports a pre-configured Axios instance for API requests.
 * The base URL changes depending on the development or production environment.
 * Includes a response interceptor to handle API errors globally.
 */

import axios from 'axios';
import { API_URL, API_URL_DEV } from '@env';

/**
 * Axios instance with base URL and default headers.
 */
const api = axios.create({
    baseURL: __DEV__ ? API_URL_DEV : API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Response interceptor to catch and log API errors.
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response || error);
        return Promise.reject(error);
    }
);

export default api;