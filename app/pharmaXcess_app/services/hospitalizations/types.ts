export interface Hospitalization {
    id?: string;
    name: string;
    description: string;
    beginDate: string;
    endDate: string;
    department: string;
    hospital: string;
    doctor: string;
    medications: string;
}

export type GetHospitalizationsResponse = Hospitalization[];

export interface CreateHospitalizationData {
    name: string;
    description: string;
    beginDate: string;
    endDate: string;
    department: string;
    hospital: string;
    doctor: string;
    medications: string;
}

export type CreateHospitalizationResponse = Hospitalization;

export interface UpdateHospitalizationData extends Partial<CreateHospitalizationData> {
    id: string;
}

export type UpdateHospitalizationResponse = Hospitalization;

export interface DeleteHospitalizationResponse {
    success: boolean;
    message: string;
}
