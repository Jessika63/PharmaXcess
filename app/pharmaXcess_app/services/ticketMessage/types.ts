export interface TicketMessage {
    id: number;
    ticketId: number;
    userId: number;
    message: string;
    createdAt: string;
}

export interface TicketMessagePageData {
    ticketID: number;
    x: number;
    y: number;
}
export type TicketMessagePageResponse = TicketMessage[];

export interface CreateTicketMessageData {
    message: string;
    ticketID: number;
}
