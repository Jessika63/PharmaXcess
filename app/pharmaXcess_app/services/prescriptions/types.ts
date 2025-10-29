export interface Prescription {
    id: number;
    name: string;
    date: string;
    doctor: string;
    medications: string;
}

export type GetPrescriptionsResponse = Prescription[];

export interface CreatePrescriptionData {
    name: string;
    date: string;
    doctor: string;
    medications: string;
}

export type CreatePrescriptionResponse = Prescription;
