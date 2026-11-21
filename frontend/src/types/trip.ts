// The same values as the TripTag enum in the backend
export type TripTag = 'MOUNTAINS' | 'SEA' | 'CITY_TRIP' | 'FOOD' | 'FRIENDS_AND_FAMILY'

// All tags in display order, with their German labels
export const TRIP_TAGS: TripTag[] = ['MOUNTAINS', 'SEA', 'CITY_TRIP', 'FOOD', 'FRIENDS_AND_FAMILY']

export const TRIP_TAG_LABELS: Record<TripTag, string> = {
    MOUNTAINS: 'Berge',
    SEA: 'Meer',
    CITY_TRIP: 'Städtetrip',
    FOOD: 'Essen',
    FRIENDS_AND_FAMILY: 'Freunde & Familie',
}

// How the user spent the time at a stop; the same values as the StopType enum in the backend.
// Overnight stops and stops passed on the way are the route of the trip; a day trip goes there and back
// from the last overnight stop (its base) and is not part of the route.
export type StopType = 'OVERNIGHT' | 'PASSING_THROUGH' | 'DAY_TRIP'

// All types in display order, with their German labels and a short explanation for the stop dialog
export const STOP_TYPES: StopType[] = ['OVERNIGHT', 'PASSING_THROUGH', 'DAY_TRIP']

export const STOP_TYPE_LABELS: Record<StopType, string> = {
    OVERNIGHT: 'Übernachtung',
    PASSING_THROUGH: 'Durchreise',
    DAY_TRIP: 'Tagesausflug',
}

export const STOP_TYPE_HINTS: Record<StopType, string> = {
    OVERNIGHT: 'Hier übernachtet',
    PASSING_THROUGH: 'Unterwegs zum nächsten Übernachtungsort',
    DAY_TRIP: 'Hin und zurück am selben Tag',
}

// A place visited during a trip (StopResponse in the backend)
export type Stop = {
    id: string
    name: string
    latitude: number
    longitude: number
    countryCode: string // ISO 3166-1 alpha-2, e.g. "IT"
    date: string // arrival date, e.g. "2024-05-15"
    // last day of the stay: for an overnight stop the arrival at the next one or the end of the trip,
    // for the only stop of a trip the end of the trip, otherwise the same as date
    departureDate: string
    note: string | null
    type: StopType
    onRoute: boolean // the route line of the trip connects this stop
    // straight line in km: for a stop on the route from the previous one on the route, for a day trip from its base;
    // null if there is none
    distanceFromPreviousKm: number | null
    baseStopId: string | null // for a day trip: the overnight stop the user started from
    photoIds: string[]
}

// A trip as returned by GET /api/trips (TripResponse in the backend)
export type Trip = {
    id: string
    title: string // the user's own title or, without one, built from the places, e.g. "Rom – Florenz"
    customTitle: string | null // the user's own title; null if the title is built from the places
    description: string | null
    startDate: string // ISO date, e.g. "2024-05-12"
    endDate: string
    coverColor: string | null
    tags: TripTag[] // empty if the trip has no tags
    stops: Stop[] // in the order of the visit (by date)
    routeLengthKm: number // sum of the straight-line distances between the stops on the route
    coverPhotoId: string | null
}