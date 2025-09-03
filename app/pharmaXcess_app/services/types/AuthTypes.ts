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

export interface ForgotPasswordData {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordData {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
}

export interface ResetPasswordResponse {
    message: string;
}
