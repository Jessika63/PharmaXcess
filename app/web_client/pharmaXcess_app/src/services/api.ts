import axios from 'axios';
import { API_URL, API_URL_DEV } from '@env';

const api = axios.create({
    baseURL: __DEV__ ? API_URL_DEV : API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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