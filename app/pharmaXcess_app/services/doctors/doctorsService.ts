import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    Doctor,
    GetDoctorsResponse,
    CreateDoctorData,
    CreateDoctorResponse,
    UpdateDoctorData,
    UpdateDoctorResponse,
    DeleteDoctorResponse,
} from './types';

/**
 * Get all doctors
 * @returns Promise<GetDoctorsResponse>
 */
export async function getDoctors(): Promise<GetDoctorsResponse> {
    console.log('Fetching doctors from API...');
    try {
        // const response = await api.get<GetDoctorsResponse>('/api/doctors', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve([
            {
                id: '1',
                name: 'Dr. Jean Dupont',
                specialty: 'Cardiologue',
                phoneNumber: '01 23 45 67 89',
                email: 'dupont.cardio@hotmail.com',
                address: '1 rue de la santé, 75000 Paris',
                hospital: 'Hôpital Cochin',
            },
            {
                id: '2',
                name: 'Dr. Marie Curie',
                specialty: 'Oncologue',
                phoneNumber: '01 23 45 67 90',
                email: 'curie.onco@hotmail.com',
                address: '2 avenue de la médecine, 75000 Paris',
                hospital: 'Hôpital Pitié-Salpêtrière',
            },
        ]);
    } catch (error: any) {
        console.error('Get Doctors Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new doctor
 * @param data CreateDoctorData
 * @returns Promise<CreateDoctorResponse>
 */
export async function createDoctor(data: CreateDoctorData): Promise<CreateDoctorResponse> {
    console.log('Creating doctor with data:', data);
    try {
        // const response = await api.post<CreateDoctorResponse>('/api/doctors', data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({ id: Math.random().toString(), ...data });
    } catch (error: any) {
        console.error('Create Doctor Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing doctor
 * @param data UpdateDoctorData
 * @returns Promise<UpdateDoctorResponse>
 */
export async function updateDoctor(data: UpdateDoctorData): Promise<UpdateDoctorResponse> {
    console.log('Updating doctor with data:', data);
    try {
        // const response = await api.put<UpdateDoctorResponse>(`/api/doctors/${data.id}`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve({
            id: data.id,
            name: data.name || 'Dr. Inconnu',
            specialty: data.specialty || 'Médecin généraliste',
            phoneNumber: data.phoneNumber || '00 00 00 00 00',
            email: data.email || 'inconnu@exemple.com',
            address: data.address || 'Adresse inconnue',
            hospital: data.hospital || 'Hôpital inconnu',
        });
    } catch (error: any) {
        console.error('Update Doctor Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a doctor by ID
 * @param id string
 * @returns Promise<DeleteDoctorResponse>
 */
export async function deleteDoctor(id: string): Promise<DeleteDoctorResponse> {
    console.log('Deleting doctor with ID:', id);
    try {
        // await api.delete(`/api/doctors/${id}`, {
        //     headers: defaultHeaders
        // });
        return Promise.resolve({
            success: true,
            message: `Médecin ${id} supprimé avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Doctor Error:', error);
        return Promise.reject(error);
    }
}
