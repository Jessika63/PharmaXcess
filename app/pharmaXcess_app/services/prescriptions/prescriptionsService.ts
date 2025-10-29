import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Prescription,
    GetPrescriptionsResponse,
    CreatePrescriptionData,
    CreatePrescriptionResponse,
} from './types';

/**
 * Get all prescriptions
 * @returns Promise<GetPrescriptionsResponse>
 */
export async function getPrescriptions(): Promise<GetPrescriptionsResponse> {
    // console.log('Fetching all prescriptions...');
    try {
        const response = await api.get<GetPrescriptionsResponse>('/api/prescriptions', {
        headers: defaultHeaders,
        });
        console.log('Get Prescriptions Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Prescriptions Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * Create a new prescription
 * @param data CreatePrescriptionData
 * @returns Promise<CreatePrescriptionResponse>
 */
export async function createPrescription(data: CreatePrescriptionData): Promise<CreatePrescriptionResponse> {
    console.log('Creating new prescription with data:', data);
    try {
        const response = await api.post<CreatePrescriptionResponse>('/api/prescriptions', data, {
            headers: defaultHeaders,
        });
        console.log('Create Prescription Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Create Prescription Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}
