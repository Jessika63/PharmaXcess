export type Message = {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: string;
    isRead: boolean;
};

export type ChatItem = {
    id: string;
    title: string;
    name: string;
    question: string;
    date: string;
    messages: Message[];
    status: 'open' | 'closed' | 'pending';
    lastActivity: string;
};

export type TicketsListResponse = ChatItem[];

export type TicketResponse = ChatItem;

export type CreateTicketData = {
    title: string;
    name: string;
    question: string;
    status?: 'open' | 'closed' | 'pending';
};

export type UpdateTicketData = Partial<{
    title: string;
    name: string;
    question: string;
    status: 'open' | 'closed' | 'pending';
    lastActivity: string;
    messages: Message[];
}>;
