export interface PatientInfoResponse {
    name: string;
    birthDate: string;
    age: number;
    weight: string;
    height: string;
    bloodType: string;
    phone: string;
    email: string;
    socialSecurityNumber: string;
    address: string;
    emergencyContact: string;
}

export interface UpdatePatientInfoData extends Partial<PatientInfoResponse> {}

export interface UpdatePatientInfoResponse {
    success: boolean;
    message: string;
    updatedData?: UpdatePatientInfoData;
}
