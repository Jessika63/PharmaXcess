export interface Ticket {
    id: number;
    title: string;
    userId: number;
    assignedTo: number;
    createdAt: string;
    updatedAt: string;
    status: string;
}

export interface CreateTicketData {
    title: string;
}

export interface AcceptTicketData {
    userID: number;
    ticketID: number;
}

export interface TicketPageData {
    x: number;
    y: number;
}
export type TicketPageResponse = Ticket[];
