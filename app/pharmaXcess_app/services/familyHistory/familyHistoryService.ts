import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    FamilyHistoryItem,
    GetFamilyHistoryResponse,
    CreateFamilyHistoryResponse,
    UpdateFamilyHistoryResponse,
    DeleteFamilyHistoryResponse,
} from './types';

/**
 * Get all family history items
 * @returns Promise<GetFamilyHistoryResponse>
 */
export async function getFamilyHistory(): Promise<GetFamilyHistoryResponse> {
    try {
        // const response = await api.get<GetFamilyHistoryResponse>('/api/family-history', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve([
            {
                id: '1',
                name: 'Diabète de type 2',
                familyMember: 'Père',
                severity: 'Modéré',
                treatment: 'Insuline, régime alimentaire',
            },
            {
                id: '2',
                name: 'Hypertension artérielle',
                familyMember: 'Mère',
                severity: 'Sévère',
                treatment: 'Bêtabloquants, régime alimentaire',
            },
        ]);
    } catch (error: any) {
        console.error('Get Family History Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new family history item
 * @param data FamilyHistoryItem
 * @returns Promise<CreateFamilyHistoryResponse>
 */
export async function createFamilyHistory(data: Omit<FamilyHistoryItem, 'id'>): Promise<CreateFamilyHistoryResponse> {
    try {
        // const response = await api.post<CreateFamilyHistoryResponse>('/api/family-history', data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({ id: Math.random().toString(), ...data });
    } catch (error: any) {
        console.error('Create Family History Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing family history item
 * @param data FamilyHistoryItem
 * @returns Promise<UpdateFamilyHistoryResponse>
 */
export async function updateFamilyHistory(data: FamilyHistoryItem): Promise<UpdateFamilyHistoryResponse> {
    try {
        // const response = await api.put<UpdateFamilyHistoryResponse>(`/api/family-history/${data.id}`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve(data);
    } catch (error: any) {
        console.error('Update Family History Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a family history item by ID
 * @param id string
 * @returns Promise<DeleteFamilyHistoryResponse>
 */
export async function deleteFamilyHistory(id: string): Promise<DeleteFamilyHistoryResponse> {
    try {
        // await api.delete(`/api/family-history/${id}`, {
        //     headers: defaultHeaders,
        // });
        return Promise.resolve({
            success: true,
            message: `Antécédent ${id} supprimé avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Family History Error:', error);
        return Promise.reject(error);
    }
}
