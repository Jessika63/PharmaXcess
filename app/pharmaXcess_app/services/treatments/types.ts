export interface Treatment {
    id: string;
    name: string;
    beginDate: string;
    endDate: string;
    dosage: string;
    duration: string;
    sideEffects: string;
    disease: string;
}

export type GetTreatmentsResponse = Treatment[];

export interface CreateTreatmentData {
    name: string;
    beginDate: string;
    endDate: string;
    dosage: string;
    duration: string;
    sideEffects: string;
    disease: string;
}

export type CreateTreatmentResponse = Treatment;

export interface UpdateTreatmentData extends Partial<CreateTreatmentData> {
    id: string;
}

export type UpdateTreatmentResponse = Treatment;

export interface DeleteTreatmentResponse {
    success: boolean;
    message: string;
}
