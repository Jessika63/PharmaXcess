import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Hospitalization,
    GetHospitalizationsResponse,
    CreateHospitalizationData,
    CreateHospitalizationResponse,
    UpdateHospitalizationData,
    UpdateHospitalizationResponse,
    DeleteHospitalizationResponse,
} from './types';

/**
 * Get all hospitalizations
 * @returns Promise<GetHospitalizationsResponse>
 */
export async function getHospitalizations(): Promise<GetHospitalizationsResponse> {
    try {
        // const response = await api.get<GetHospitalizationsResponse>('/api/hospitalizations', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve([
            {
                id: '1',
                name: 'Opération de l\'appendice',
                description: 'Appendicectomie en urgence suite à une appendicite aiguë.',
                beginDate: '15/03/2022',
                endDate: '18/03/2022',
                department: 'Chirurgie digestive',
                hospital: 'Hôpital Saint-Louis',
                doctor: 'Dr. Martin',
                medications: 'Antibiotiques, antalgiques, anti-inflammatoires',
            },
            {
                id: '2',
                name: 'Hospitalisation COVID-19',
                description: 'Hospitalisation pour complications respiratoires liées au COVID-19.',
                beginDate: '10/01/2021',
                endDate: '25/01/2021',
                department: 'Pneumologie',
                hospital: 'Hôpital Bichat',
                doctor: 'Dr. Durand',
                medications: 'Oxygénothérapie, corticoïdes, anticoagulants',
            },
        ]);
    } catch (error: any) {
        console.error('Get Hospitalizations Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new hospitalization
 * @param data CreateHospitalizationData
 * @returns Promise<CreateHospitalizationResponse>
 */
export async function createHospitalization(data: CreateHospitalizationData): Promise<CreateHospitalizationResponse> {
    try {
        // const response = await api.post<CreateHospitalizationResponse>('/api/hospitalizations', data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({
            id: Math.random().toString(),
            ...data,
        });
    } catch (error: any) {
        console.error('Create Hospitalization Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing hospitalization
 * @param data UpdateHospitalizationData
 * @returns Promise<UpdateHospitalizationResponse>
 */
export async function updateHospitalization(data: UpdateHospitalizationData): Promise<UpdateHospitalizationResponse> {
    try {
        // const response = await api.put<UpdateHospitalizationResponse>(`/api/hospitalizations/${data.id}`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({
            id: data.id,
            name: data.name || 'Hospitalisation',
            description: data.description || '',
            beginDate: data.beginDate || '01/01/2024',
            endDate: data.endDate || '01/01/2024',
            department: data.department || '',
            hospital: data.hospital || '',
            doctor: data.doctor || '',
            medications: data.medications || '',
        });
    } catch (error: any) {
        console.error('Update Hospitalization Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a hospitalization by ID
 * @param id string
 * @returns Promise<DeleteHospitalizationResponse>
 */
export async function deleteHospitalization(id: string): Promise<DeleteHospitalizationResponse> {
    try {
        // await api.delete(`/api/hospitalizations/${id}`, {
        //     headers: defaultHeaders
        // });
        return Promise.resolve({
            success: true,
            message: `Hospitalisation ${id} supprimée avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Hospitalization Error:', error);
        return Promise.reject(error);
    }
}
