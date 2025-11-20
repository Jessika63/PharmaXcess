import api from '../api';
import defaultHeaders from '../sonarHeader';
import { PatientInfoResponse, UpdatePatientInfoData, UpdatePatientInfoResponse } from './types';

/**
 * Get patient info for a profile
 * @param profileId string
 * @returns Promise<PatientInfoResponse>
 */
export async function getPatientInfo(profileId: string): Promise<PatientInfoResponse> {
    try {
        // const response = await api.get<PatientInfoResponse>(`/api/patient-info/${profileId}`, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        return Promise.resolve({
            name: 'John Doe',
            birthDate: '01/01/1980',
            age: 42,
            weight: '70 kg',
            height: '180 cm',
            bloodType: 'A+',
            phone: '06 12 34 56 78',
            email: 'johndoe@hotmail.com',
            socialSecurityNumber: '123-45-6789',
            address: '1 rue de la paix, 75000 Paris',
            emergencyContact: 'Jane Doe, 06 12 34 56 79',
        });
    } catch (error: any) {
        console.error('Get Patient Info Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update patient info
 * @param profileId string
 * @param data UpdatePatientInfoData
 * @returns Promise<UpdatePatientInfoResponse>
 */
export async function updatePatientInfo(
    profileId: string,
    data: UpdatePatientInfoData
): Promise<UpdatePatientInfoResponse> {
    try {
        // const response = await api.put<UpdatePatientInfoResponse>(
        //     `/api/patient-info/${profileId}`,
        //     data,
        //     { headers: defaultHeaders }
        // );
        // return response.data;

        return Promise.resolve({
            success: true,
            message: 'Informations mises à jour (simulation)',
            updatedData: data,
        });
    } catch (error: any) {
        console.error('Update Patient Info Error:', error);
        return Promise.reject(error);
    }
}
