export interface PrescriptionReminder {
    id: string;
    name: string;
    date: string;
    dueDate: Date;
    sound: string;
    isCompleted: boolean;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
}

export type GetPrescriptionRemindersResponse = PrescriptionReminder[];

export type CreatePrescriptionReminderData = Omit<PrescriptionReminder, 'id'>;
export type CreatePrescriptionReminderResponse = PrescriptionReminder;

export type UpdatePrescriptionReminderData = Partial<PrescriptionReminder>;
export type UpdatePrescriptionReminderResponse = PrescriptionReminder;

export type DeletePrescriptionReminderResponse = boolean;
