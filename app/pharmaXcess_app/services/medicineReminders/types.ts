export interface MedicineReminder {
    id: string;
    medicineName: string;
    time: string;
    days: string[];
    sound: string;
    isActive: boolean;
    dosage: string;
    nextAlarm?: string;
}

export type GetMedicineRemindersResponse = MedicineReminder[];

export interface CreateMedicineReminderData {
    medicineName: string;
    time: string;
    days: string[];
    sound: string;
    isActive: boolean;
    dosage: string;
}

export type CreateMedicineReminderResponse = MedicineReminder;

export interface UpdateMedicineReminderData extends Partial<CreateMedicineReminderData> {
    id: string;
}

export type UpdateMedicineReminderResponse = MedicineReminder;

export interface DeleteMedicineReminderResponse {
    success: boolean;
    message: string;
}
