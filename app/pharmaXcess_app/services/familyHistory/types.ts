export interface FamilyHistoryItem {
    id?: string;
    name: string;
    familyMember: string;
    severity: string;
    treatment: string;
}

export type GetFamilyHistoryResponse = FamilyHistoryItem[];
export type CreateFamilyHistoryResponse = FamilyHistoryItem;
export type UpdateFamilyHistoryResponse = FamilyHistoryItem;
export type DeleteFamilyHistoryResponse = {
    success: boolean;
    message: string;
};
