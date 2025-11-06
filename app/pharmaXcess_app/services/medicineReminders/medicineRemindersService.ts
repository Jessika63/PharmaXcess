import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    MedicineReminder,
    GetMedicineRemindersResponse,
    CreateMedicineReminderData,
    CreateMedicineReminderResponse,
    UpdateMedicineReminderData,
    UpdateMedicineReminderResponse,
    DeleteMedicineReminderResponse,
} from './types';

/**
 * Get all medicine reminders
 * @returns Promise<GetMedicineRemindersResponse>
 */
export async function getMedicineReminders(): Promise<GetMedicineRemindersResponse> {
    try {
        // const response = await api.get<GetMedicineRemindersResponse>('/api/medicine-reminders', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve([
            {
                id: '1',
                medicineName: 'Paracétamol',
                time: '08:00',
                days: ['Lundi', 'Mercredi', 'Vendredi'],
                sound: 'Son 1',
                isActive: true,
                dosage: '500mg',
                nextAlarm: new Date().toISOString(),
            },
            {
                id: '2',
                medicineName: 'Ibuprofène',
                time: '12:00',
                days: ['Mardi', 'Jeudi'],
                sound: 'Son 2',
                isActive: false,
                dosage: '200mg',
                nextAlarm: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Get Medicine Reminders Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new medicine reminder
 * @param data CreateMedicineReminderData
 * @returns Promise<CreateMedicineReminderResponse>
 */
export async function createMedicineReminder(data: CreateMedicineReminderData): Promise<CreateMedicineReminderResponse> {
  try {
    // const response = await api.post<CreateMedicineReminderResponse>('/api/medicine-reminders', data, {
    //     headers: defaultHeaders,
    // });
    // return response.data;
    return Promise.resolve({id: Math.random().toString(), ...data, nextAlarm: new Date().toISOString()});
    } catch (error: any) {
        console.error('Create Medicine Reminder Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing medicine reminder
 * @param data UpdateMedicineReminderData
 * @returns Promise<UpdateMedicineReminderResponse>
 */
export async function updateMedicineReminder(data: UpdateMedicineReminderData): Promise<UpdateMedicineReminderResponse> {
    try {
    //     const response = await api.put<UpdateMedicineReminderResponse>(`/api/medicine-reminders/${data.id}`, data, {
    //     headers: defaultHeaders,
    // });
    // return response.data;

    return Promise.resolve({
        id: data.id,
        medicineName: data.medicineName || 'Aspirine',
        time: data.time || '10:00',
        days: data.days || ['Lundi'],
        sound: data.sound || 'Son 1',
        isActive: data.isActive ?? true,
        dosage: data.dosage || '500mg',
        nextAlarm: new Date().toISOString(),
    });
    } catch (error: any) {
        console.error('Update Medicine Reminder Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a medicine reminder by ID
 * @param id string
 * @returns Promise<DeleteMedicineReminderResponse>
 */
export async function deleteMedicineReminder(id: string): Promise<DeleteMedicineReminderResponse> {
    try {
        // await api.delete(`/api/medicine-reminders/${id}`, {
        //     headers: defaultHeaders
        // });

        return Promise.resolve({
            success: true,
            message: `Rappel ${id} supprimé avec succès (simulation).`,
        });
    } catch (error: any) {
        console.error('Delete Medicine Reminder Error:', error);
        return Promise.reject(error);
    }
}