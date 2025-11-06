import api from '../api';
import defaultHeaders from '../sonarHeader';
import {
    PrescriptionReminder,
    GetPrescriptionRemindersResponse,
    CreatePrescriptionReminderData,
    CreatePrescriptionReminderResponse,
    UpdatePrescriptionReminderData,
    UpdatePrescriptionReminderResponse,
    DeletePrescriptionReminderResponse,
} from './types';

let reminders: PrescriptionReminder[] = [
    {
        id: '1',
        name: 'Renouvellement Paracétamol',
        date: '15/07/2025',
        dueDate: new Date('2025-07-15'),
        sound: 'Son 1',
        isCompleted: false,
        priority: 'high',
        notes: 'Ordonnance expire bientôt',
    },
    {
        id: '2',
        name: 'Consultation cardiologue',
        date: '20/07/2025',
        dueDate: new Date('2025-07-20'),
        sound: 'Son 2',
        isCompleted: true,
        priority: 'medium',
        notes: 'RDV pris, confirmation reçue',
    },
];

/**
 * Get all prescription reminders
 */
export async function getPrescriptionReminders(): Promise<GetPrescriptionRemindersResponse> {
    try {
        // const response = await api.get<GetPrescriptionRemindersResponse>('/api/prescription-reminders', {
        //     headers: defaultHeaders,
        // });
        // return response.data;
        return Promise.resolve(reminders);
    } catch (error) {
        console.error('Get Prescription Reminders Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new reminder
 */
export async function createPrescriptionReminder(data: CreatePrescriptionReminderData): Promise<CreatePrescriptionReminderResponse> {
    try {
        // const response = await api.post<CreatePrescriptionReminderResponse>('/api/prescription-reminders', data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        const newReminder: PrescriptionReminder = {
            id: Math.random().toString(),
            ...data,
        };
        reminders.push(newReminder);
        return Promise.resolve(newReminder);
    } catch (error) {
        console.error('Create Prescription Reminder Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update a reminder
 */
export async function updatePrescriptionReminder(id: string, data: UpdatePrescriptionReminderData): Promise<UpdatePrescriptionReminderResponse> {
    try {
        // const response = await api.put<UpdatePrescriptionReminderResponse>(`/api/prescription-reminders/${id}`, data, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        reminders = reminders.map((r) => (r.id === id ? { ...r, ...data } : r));
        const updated = reminders.find((r) => r.id === id)!;
        return Promise.resolve(updated);
    } catch (error) {
        console.error('Update Prescription Reminder Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a reminder
 */
export async function deletePrescriptionReminder(id: string): Promise<DeletePrescriptionReminderResponse> {
    try {
        // await api.delete(`/api/prescription-reminders/${id}`, { headers: defaultHeaders });

        reminders = reminders.filter((r) => r.id !== id);
        return Promise.resolve(true);
    } catch (error) {
        console.error('Delete Prescription Reminder Error:', error);
        return Promise.reject(error);
    }
}
