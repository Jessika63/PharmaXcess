import axios from 'axios';
import { API_URL, API_URL_DEV } from '@env';

let authToken: string | null = null;

const api = axios.create({
    baseURL: __DEV__ ? API_URL_DEV : API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setAuthToken(token: string | null) {
    authToken = token;
    console.log('Auth Token Set:', authToken);
}

api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error);
        return Promise.reject(error);
    }
);

export default api;