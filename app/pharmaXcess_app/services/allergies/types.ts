export interface Allergy {
    id?: string;
    name: string;
    beginDate: string;
    severity: string;
    symptoms: string;
    medications: string;
    comments: string;
}

export type GetAllergiesResponse = Allergy[];

export interface CreateAllergyData {
    name: string;
    beginDate: string;
    severity: string;
    symptoms: string;
    medications: string;
    comments: string;
}

export type CreateAllergyResponse = Allergy;

export interface UpdateAllergyData extends Partial<CreateAllergyData> {
    id: string;
}

export type UpdateAllergyResponse = Allergy;

export interface DeleteAllergyResponse {
    success: boolean;
    message: string;
}
