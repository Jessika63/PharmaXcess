import api from '../api';
import {
    GetMachinesResponse,
    NearestMachinesData,
    NearestMachinesResponse,
    ItineraryMachineData,
    ItineraryMachineResponse,
} from './types';

/**
 * Get all machines
 * @returns Promise<GetMachinesResponse>
 */
export async function getMachines(): Promise<GetMachinesResponse> {
    console.log('Fetching all machines...');
    try {
        const response = await api.get<GetMachinesResponse>('/api/machines');
        console.log('Get Machines Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Machines Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * @param data NearestMachinesData
 * @returns Promise<NearestMachinesResponse>
 */
export async function getNearestMachines(data: NearestMachinesData): Promise<NearestMachinesResponse> {
    console.log('Fetching nearest machines with params:', data);
    try {
        const response = await api.get<NearestMachinesResponse>('/api/machines/nearest', {
            params: data,
        });
        console.log('Get Nearest Machines Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Nearest Machines Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}

/**
 * @param data ItineraryMachineData
 * @returns Promise<ItineraryMachineResponse>
 */
export async function getItineraryMachine(data: ItineraryMachineData): Promise<ItineraryMachineResponse> {
    console.log('Fetching itinerary for machine with params:', data);
    try {
        const response = await api.get<ItineraryMachineResponse>('/api/machines/itinary', {
            params: data,
        });
        console.log('Get Itinerary Machine Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Get Itinerary Machine Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
}
