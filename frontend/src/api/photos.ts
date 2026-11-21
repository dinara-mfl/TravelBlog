import api from './client'
import type {Trip} from '../types/trip'
import {resizeImage} from '../utils/resizeImage'

export const MAX_PHOTOS_PER_STOP = 5

// Uploading and deleting return the whole trip, like the stop endpoints

export async function uploadPhoto(tripId: string, stopId: string, photo: Blob): Promise<Trip> {
    const form = new FormData()
    form.append('file', photo, 'photo.jpg')
    const response = await api.post<Trip>(`/api/trips/${tripId}/stops/${stopId}/photos`, form)
    return response.data
}

export async function deletePhoto(tripId: string, stopId: string, photoId: string): Promise<Trip> {
    const response = await api.delete<Trip>(`/api/trips/${tripId}/stops/${stopId}/photos/${photoId}`)
    return response.data
}

// <img> cannot send the token, so photos are loaded with axios and shown from a local object URL.
// Each photo is loaded only once per page visit; a photo never changes.
const photoUrls = new Map<string, Promise<string>>()

export function loadPhotoUrl(photoId: string): Promise<string> {
    let url = photoUrls.get(photoId)
    if (!url) {
        url = api.get<Blob>(`/api/photos/${photoId}`, {responseType: 'blob'})
            .then((response) => URL.createObjectURL(response.data))
        url.catch(() => photoUrls.delete(photoId)) // try again next time
        photoUrls.set(photoId, url)
    }
    return url
}

// Shown after the stop or trip was saved but some photos were not
export function photoWarning(failed: number): string | undefined {
    if (failed === 0) return undefined
    return failed === 1
        ? '1 Foto konnte nicht gespeichert werden. Bitte versuche es noch einmal.'
        : `${failed} Fotos konnten nicht gespeichert werden. Bitte versuche es noch einmal.`
}

/**
 * Deletes the removed photos of a stop and uploads the new ones, one after the other.
 * Returns the trip after the last successful change (null if nothing changed) and the number of failed photos.
 */
export async function savePhotos(
    tripId: string,
    stopId: string,
    removedPhotoIds: string[],
    newFiles: File[],
): Promise<{ trip: Trip | null; failed: number }> {
    let trip: Trip | null = null
    let failed = 0
    // One request after the other: the backend checks the limit of 5 photos per stop
    for (const photoId of removedPhotoIds) {
        try {
            trip = await deletePhoto(tripId, stopId, photoId)
        } catch {
            failed++
        }
    }
    for (const file of newFiles) {
        try {
            trip = await uploadPhoto(tripId, stopId, await resizeImage(file))
        } catch {
            failed++
        }
    }
    return {trip, failed}
}