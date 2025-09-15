import api from '../api';
import {
    Ticket,
    CreateTicketData,
    AcceptTicketData,
    TicketPageData,
    TicketPageResponse,
} from './types';

import defaultHeaders from '../sonarHeader';

/**
 * Create a new ticket
 * @param data CreateTicketData
 * @returns Promise<Ticket>
 */
export async function createTicket(data: CreateTicketData): Promise<Ticket> {
    console.log('Creating ticket with data:', data);
    try {
        const response = await api.post<Ticket>('/api/ticket/create', data, { headers: defaultHeaders });
        console.log('Create Ticket Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Create Ticket Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * Accept a ticket
 * @param data AcceptTicketData
 * @returns Promise<Ticket>
 */
export async function acceptTicket(data: AcceptTicketData): Promise<Ticket> {
    console.log('Accepting ticket with data:', data);
    try {
        const response = await api.post<Ticket>('/api/ticket/accept', data, { headers: defaultHeaders });
        console.log('Accept Ticket Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Accept Ticket Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * Get tickets page
 * @param data TicketPageData
 * @returns Promise<TicketPageResponse>
 */
export async function getTicketsPage(data: TicketPageData): Promise<TicketPageResponse> {
    console.log('Fetching tickets page with params:', data);
    try {
        const response = await api.get<TicketPageResponse>('/api/ticket/ticket_page', {
            params: data,
            headers: defaultHeaders,
        });
        console.log('Get Tickets Page Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Tickets Page Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}
