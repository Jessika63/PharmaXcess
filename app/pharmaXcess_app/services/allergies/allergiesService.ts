import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Allergy,
    GetAllergiesResponse,
    CreateAllergyData,
    CreateAllergyResponse,
    UpdateAllergyData,
    UpdateAllergyResponse,
    DeleteAllergyResponse,
} from './types';

/**
 * Get all allergies
 * @returns Promise<GetAllergiesResponse>
 */
export async function getAllergies(): Promise<GetAllergiesResponse> {
    try {
        // const response = await api.get<GetAllergiesResponse>('/api/allergies', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve([
            {
                id: '1',
                name: 'Pollen',
                beginDate: '01/01/2021',
                severity: 'Modérée',
                symptoms: 'Éternuements, nez qui coule',
                medications: 'Antihistaminiques',
                comments: 'Allergie saisonnière',
            },
            {
                id: '2',
                name: 'Pénicilline',
                beginDate: '01/01/2020',
                severity: 'Sévère',
                symptoms: 'Urticaire, œdème de Quincke',
                medications: 'Éviter les pénicillines',
                comments: 'Allergie connue',
            },
        ]);
    } catch (error: any) {
        console.error('Get Allergies Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new allergy
 * @param data CreateAllergyData
 * @returns Promise<CreateAllergyResponse>
 */
export async function createAllergy(data: CreateAllergyData): Promise<CreateAllergyResponse> {
    try {
        // const response = await api.post<CreateAllergyResponse>('/api/allergies', data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({
            id: Math.random().toString(),
            ...data,
        });
    } catch (error: any) {
        console.error('Create Allergy Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing allergy
 * @param data UpdateAllergyData
 * @returns Promise<UpdateAllergyResponse>
 */
export async function updateAllergy(data: UpdateAllergyData): Promise<UpdateAllergyResponse> {
    try {
        // const response = await api.put<UpdateAllergyResponse>(`/api/allergies/${data.id}`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({
            id: data.id,
            name: data.name || 'Allergie inconnue',
            beginDate: data.beginDate || '01/01/2024',
            severity: data.severity || 'Modérée',
            symptoms: data.symptoms || 'Aucun symptôme',
            medications: data.medications || 'Aucun médicament',
            comments: data.comments || 'Aucun commentaire',
        });
    } catch (error: any) {
        console.error('Update Allergy Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete an allergy by ID
 * @param id string
 * @returns Promise<DeleteAllergyResponse>
 */
export async function deleteAllergy(id: string): Promise<DeleteAllergyResponse> {
    try {
        // await api.delete(`/api/allergies/${id}`, {
        //     headers: defaultHeaders,
        // });
        return Promise.resolve({
            success: true,
            message: `Allergie ${id} supprimée avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Allergy Error:', error);
        return Promise.reject(error);
    }
}
