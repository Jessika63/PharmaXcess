export interface Doctor {
    id?: string;
    name: string;
    specialty: string;
    hospital: string;
    phoneNumber: string;
    email: string;
    address: string;
}

export type GetDoctorsResponse = Doctor[];

export interface CreateDoctorData {
    name: string;
    specialty: string;
    hospital: string;
    phoneNumber: string;
    email: string;
    address: string;
}

export type CreateDoctorResponse = Doctor;

export interface UpdateDoctorData extends Partial<CreateDoctorData> {
    id: string;
}

export type UpdateDoctorResponse = Doctor;

export interface DeleteDoctorResponse {
    success: boolean;
    message: string;
}
