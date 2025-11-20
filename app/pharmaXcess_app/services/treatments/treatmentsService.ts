import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Treatment,
    GetTreatmentsResponse,
    CreateTreatmentData,
    CreateTreatmentResponse,
    UpdateTreatmentData,
    UpdateTreatmentResponse,
    DeleteTreatmentResponse,
} from './types';

/**
 * Get all treatments
 * @returns Promise<GetTreatmentsResponse>
 */
export async function getTreatments(): Promise<GetTreatmentsResponse> {
    try {
        // const response = await api.get<GetTreatmentsResponse>('/api/treatments', { headers: defaultHeaders });
        // return response.data;

        return Promise.resolve([
            {
                id: '1',
                name: 'Metformine',
                beginDate: '01/01/2021',
                endDate: '01/01/2022',
                dosage: '1 comprimé par jour',
                duration: '1 an',
                sideEffects: 'nausées, vomissements, diarrhée',
                disease: 'Diabète de type 2',
            },
            {
                id: '2',
                name: 'Lévothyrox',
                beginDate: '01/01/2020',
                endDate: '01/01/2022',
                dosage: '1 comprimé par jour',
                duration: '2 ans',
                sideEffects: 'palpitations, tremblements, maux de tête',
                disease: 'Hypothyroïdie',
            },
        ]);
    } catch (error: any) {
        console.error('Get Treatments Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new treatment
 * @param data CreateTreatmentData
 * @returns Promise<CreateTreatmentResponse>
 */
export async function createTreatment(data: CreateTreatmentData): Promise<CreateTreatmentResponse> {
    try {
        // const response = await api.post<CreateTreatmentResponse>('/api/treatments', data, { headers: defaultHeaders });
        // return response.data;

        return Promise.resolve({ id: Math.random().toString(), ...data });
    } catch (error: any) {
        console.error('Create Treatment Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing treatment
 * @param data UpdateTreatmentData
 * @returns Promise<UpdateTreatmentResponse>
 */
export async function updateTreatment(data: UpdateTreatmentData): Promise<UpdateTreatmentResponse> {
    try {
        // const response = await api.put<UpdateTreatmentResponse>(`/api/treatments/${data.id}`, data, { headers: defaultHeaders });
        // return response.data;

        return Promise.resolve({
            id: data.id,
            name: data.name || 'Traitement inconnu',
            beginDate: data.beginDate || '01/01/2024',
            endDate: data.endDate || '01/01/2025',
            dosage: data.dosage || '1 comprimé par jour',
            duration: data.duration || '1 mois',
            sideEffects: data.sideEffects || '',
            disease: data.disease || '',
        });
    } catch (error: any) {
        console.error('Update Treatment Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a treatment by ID
 * @param id string
 * @returns Promise<DeleteTreatmentResponse>
 */
export async function deleteTreatment(id: string): Promise<DeleteTreatmentResponse> {
    try {
        // await api.delete(`/api/treatments/${id}`, { headers: defaultHeaders });

        return Promise.resolve({
            success: true,
            message: `Traitement ${id} supprimé avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Treatment Error:', error);
        return Promise.reject(error);
    }
}
