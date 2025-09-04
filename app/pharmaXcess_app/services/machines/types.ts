export interface Machine {
    id: number;
    name: string;
    status: string;
    latitude: number;
    longitude: number;
}

export type GetMachinesResponse = Machine[];

export interface NearestMachinesData {
    latitude: number;
    longitude: number;
}
export type NearestMachinesResponse = Machine[];

export interface ItineraryMachineData {
    id: number;
    latitude: number;
    longitude: number;
}
export type ItineraryMachineResponse = string;
