export interface Disease {
    id: string;
    name: string;
    description: string;
    symptoms: string;
    beginDate: string;
    medications: string;
    examens: string;
}

export type GetDiseasesResponse = Disease[];

export interface CreateDiseaseData {
    name: string;
    description: string;
    symptoms: string;
    beginDate: string;
    medications: string;
    examens: string;
}

export type CreateDiseaseResponse = Disease;

export interface UpdateDiseaseData extends Partial<CreateDiseaseData> {
    id: string;
}

export type UpdateDiseaseResponse = Disease;

export interface DeleteDiseaseResponse {
    success: boolean;
    message: string;
}
