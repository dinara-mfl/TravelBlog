import api from './client'
import type {StopType, Trip, TripTag} from '../types/trip'

// The first place of a new trip; its arrival date is the start date of the trip
export type FirstStopRequest = {
    name: string
    latitude: number
    longitude: number
    countryCode: string
    type: StopType
}

export type TripRequest = {
    title: string
    description: string
    startDate: string
    endDate: string
    coverColor: string | null
    tags: TripTag[]
    firstStop?: FirstStopRequest // required when creating a trip, ignored when changing it
}

// Trips of the logged-in user, newest first
export async function getTrips(): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/api/trips')
    return response.data
}

export async function createTrip(request: TripRequest): Promise<Trip> {
    const response = await api.post<Trip>('/api/trips', request)
    return response.data
}

export async function getTrip(id: string): Promise<Trip> {
    const response = await api.get<Trip>(`/api/trips/${id}`)
    return response.data
}

export async function updateTrip(id: string, request: TripRequest): Promise<Trip> {
    const response = await api.put<Trip>(`/api/trips/${id}`, request)
    return response.data
}

export async function deleteTrip(id: string): Promise<void> {
    await api.delete(`/api/trips/${id}`)
}

export async function setCover(id: string, photoId: string | null): Promise<Trip> {
    const response = await api.put<Trip>(`/api/trips/${id}/cover`, {photoId})
    return response.data
}