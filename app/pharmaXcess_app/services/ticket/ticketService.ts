import api from '../api';
import defaultHeaders from '../sonarHeader';
import { ChatItem, Message, TicketsListResponse, TicketResponse, CreateTicketData, UpdateTicketData } from './types';

let tickets: ChatItem[] = [
    { 
        id: '1', 
        title: 'Problème de prescription', 
        name: 'Jean Dupont', 
        question: 'Comment renouveler ma prescription ?', 
        date: '2023-10-01',
        status: 'open',
        lastActivity: '2023-10-02 14:30',
        messages: [
            {
                id: 'm1',
                text: 'Comment renouveler ma prescription ?',
                sender: 'user',
                timestamp: '2023-10-01 10:00',
                isRead: true
            },
            {
                id: 'm2',
                text: 'Bonjour ! Pour renouveler votre prescription, vous pouvez prendre rendez-vous avec votre médecin ou demander un renouvellement en ligne.',
                sender: 'support',
                timestamp: '2023-10-01 10:15',
                isRead: true
            },
            {
                id: 'm3',
                text: 'Merci pour votre réponse. Comment puis-je faire une demande en ligne ?',
                sender: 'user',
                timestamp: '2023-10-02 14:30',
                isRead: false
            }
        ]
    },
    { 
        id: '2', 
        title: 'Question sur un médicament', 
        name: 'Marie Curie', 
        question: 'Quels sont les effets secondaires ?', 
        date: '2023-10-02',
        status: 'closed',
        lastActivity: '2023-10-03 09:15',
        messages: [
            {
                id: 'm4',
                text: 'Quels sont les effets secondaires du paracétamol ?',
                sender: 'user',
                timestamp: '2023-10-02 15:00',
                isRead: true
            },
            {
                id: 'm5',
                text: 'Les effets secondaires courants du paracétamol incluent : nausées, troubles digestifs, réactions allergiques rares. En cas d\'effets indésirables, consultez votre médecin.',
                sender: 'support',
                timestamp: '2023-10-03 09:15',
                isRead: true
            }
        ]
    },
];

/**
 * Fetch all support tickets for a given profile.
 *
 * @param profileId - The unique identifier of the user's profile.
 * @returns Promise resolving to a list of tickets.
 */
export async function getTickets(profileId: string): Promise<TicketsListResponse> {
    try {
        // const response = await api.get<ChatItem[]>(`/tickets?profileId=${profileId}`, {
        //     headers: defaultHeaders,
        // });
        // return response.data;

        return Promise.resolve(tickets);
    } catch (error) {
        console.error('Get Tickets Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Create a new support ticket.
 *
 * @param data - The ticket information provided by the user.
 * @returns Promise resolving to the newly created ticket.
 */
export async function createTicket(data: CreateTicketData): Promise<TicketResponse> {
    try {
        // const response = await api.post<ChatItem>('/tickets', data, { headers: defaultHeaders });
        // return response.data;

        const newTicket: ChatItem = {
            id: Math.random().toString(),
            ...data,
            date: new Date().toISOString().split('T')[0],
            messages: [
                {
                    id: Math.random().toString(),
                    text: data.question,
                    sender: 'user',
                    timestamp: new Date().toLocaleString('fr-FR'),
                    isRead: true,
                },
            ],
            lastActivity: new Date().toLocaleString('fr-FR'),
            status: data.status ?? 'open',
        };
        tickets.push(newTicket);
        return Promise.resolve(newTicket);
    } catch (error) {
        console.error('Create Ticket Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Update an existing ticket.
 *
 * @param id - The unique ID of the ticket to update.
 * @param data - The updated ticket data.
 * @returns Promise resolving to the updated ticket.
 */
export async function updateTicket(id: string, data: UpdateTicketData): Promise<TicketResponse> {
    try {
        // const response = await api.put<ChatItem>(`/tickets/${id}`, data, { headers: defaultHeaders });
        // return response.data;

        tickets = tickets.map((t) => (t.id === id ? { ...t, ...data } : t));
        const updated = tickets.find((t) => t.id === id)!;
        return Promise.resolve(updated);
    } catch (error) {
        console.error('Update Ticket Error:', error);
        return Promise.reject(error);
    }
}

/**
 * Delete a ticket by its ID.
 *
 * @param id - The unique ID of the ticket to delete.
 * @returns Promise resolving to `true` if deletion is successful.
 */
export async function deleteTicket(id: string): Promise<boolean> {
    try {
        // await api.delete(`/tickets/${id}`, { headers: defaultHeaders });

        tickets = tickets.filter((t) => t.id !== id);
        return Promise.resolve(true);
    } catch (error) {
        console.error('Delete Ticket Error:', error);
        return Promise.reject(error);
    }
}
