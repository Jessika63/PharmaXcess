import api from '../api';
import {
    TicketMessage,
    TicketMessagePageData,
    TicketMessagePageResponse,
    CreateTicketMessageData
} from './types';

import defaultHeaders from '../sonarHeader';

/**
 * @param data TicketMessagePageData
 * @returns Promise<TicketMessagePageResponse>
 */
export async function getTicketMessagesPage(data: TicketMessagePageData): Promise<TicketMessagePageResponse> {
    console.log('Fetching ticket messages page with params:', data);
    try {
        const response = await api.get<TicketMessagePageResponse>('/api/ticket/message/message_page', {
            params: data,
            headers: defaultHeaders,
        });
        console.log('Get Ticket Messages Page Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Ticket Messages Page Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * @param data CreateTicketMessageData
 * @returns Promise<TicketMessage>
 */
export async function createTicketMessage(data: CreateTicketMessageData): Promise<TicketMessage> {
    console.log('Creating ticket message with data:', data);
    try {
        const response = await api.get<TicketMessage>('/api/ticket/message/create', {
            params: data,
            headers: defaultHeaders,
        });
        console.log('Create Ticket Message Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Create Ticket Message Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}
