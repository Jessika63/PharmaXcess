import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:3333',
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