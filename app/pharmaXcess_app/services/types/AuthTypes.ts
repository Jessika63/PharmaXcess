export interface RegisterData {
    email: string;
    name: string;
    surname: string;
    username: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}