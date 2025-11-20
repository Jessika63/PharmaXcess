import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Disease,
    GetDiseasesResponse,
    CreateDiseaseData,
    CreateDiseaseResponse,
    UpdateDiseaseData,
    UpdateDiseaseResponse,
    DeleteDiseaseResponse
} from './types';

/**
 * Get diseases for a profile
 * @param profileId string - ID of the profile
 * @returns Promise<GetDiseasesResponse>
 */
export async function getDiseases(profileId: string): Promise<GetDiseasesResponse> {
    try {
        // const response = await api.get<GetDiseasesResponse>(`/api/profiles/${profileId}/diseases`, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        // Fake simulated response
        return Promise.resolve([
            {
                id: '1',
                name: 'Diabète',
                description: 'Le diabète est une maladie chronique qui se caractérise par un excès de sucre dans le sang.',
                symptoms: 'soif, urine fréquente, fatigue',
                beginDate: '01/01/2000',
                medications: 'insuline, metformine',
                examens: 'glycémie, hémoglobine glyquée',
            },
            {
                id: '2',
                name: 'Hypertension',
                description: 'Pression artérielle trop élevée.',
                symptoms: 'maux de tête, étourdissements',
                beginDate: '01/01/2005',
                medications: 'bêta-bloquants, diurétiques',
                examens: 'tension artérielle, ECG',
            }
        ]);
    } catch (error: any) {
        console.error('Get Diseases Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a disease for a profile
 * @param profileId string - ID of the profile
 * @param data CreateDiseaseData - Data for the new disease
 * @returns Promise<CreateDiseaseResponse>
 */
export async function createDisease(
    profileId: string,
    data: CreateDiseaseData
): Promise<CreateDiseaseResponse> {
    try {
        // const response = await api.post<CreateDiseaseResponse>(`/api/profiles/${profileId}/diseases`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        return Promise.resolve({
            id: Math.random().toString(),
            ...data,
        });
    } catch (error: any) {
        console.error('Create Disease Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update a disease
 * @param profileId string - ID of the profile
 * @param data UpdateDiseaseData - Updated data for the disease
 * @returns Promise<UpdateDiseaseResponse>
 */
export async function updateDisease(
    profileId: string,
    data: UpdateDiseaseData
): Promise<UpdateDiseaseResponse> {
    try {
        // const response = await api.put<UpdateDiseaseResponse>(
        //     `/api/profiles/${profileId}/diseases/${data.id}`,
        //     data,
        //     { headers: defaultHeaders }
        // );
        // return response.data;

        return Promise.resolve({
            id: data.id,
            name: data.name || 'Maladie mise à jour',
            description: data.description || 'Description modifiée',
            symptoms: data.symptoms || 'Symptômes modifiés',
            beginDate: data.beginDate || '01/01/2024',
            medications: data.medications || 'Traitement mis à jour',
            examens: data.examens || 'Examens mis à jour',
        });
    } catch (error: any) {
        console.error('Update Disease Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a disease
 * @param profileId string - ID of the profile
 * @param id string - ID of the disease to delete
 * @returns Promise<DeleteDiseaseResponse>
 */
export async function deleteDisease(
    profileId: string,
    id: string
): Promise<DeleteDiseaseResponse> {
    try {
        // await api.delete(`/api/profiles/${profileId}/diseases/${id}`, {
        //     headers: defaultHeaders
        // });

        return Promise.resolve({
            success: true,
            message: `Maladie ${id} supprimée (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Disease Error:', error);
        return Promise.reject(error);
    }
}
