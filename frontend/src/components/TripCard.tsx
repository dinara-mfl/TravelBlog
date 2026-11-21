import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import type {Trip} from '../types/trip'
import {getCountryName} from '../utils/countries'
import {formatDateRange} from '../utils/dates'
import {formatDays, formatKm, getCountryCodes, getTripDays} from '../utils/tripFilters'
import AuthImage from './AuthImage'
import TagBadges from './TagBadges'

// Pastel placeholder covers from the mockup, used in turn for trips without a chosen color
const fallbackCoverColors = ['bg-cover-1', 'bg-cover-2', 'bg-cover-3', 'bg-cover-4']

type TripCardProps = {
    trip: Trip
    index: number
}

function Badge({children}: Readonly<{ children: ReactNode }>) {
    return <span className="rounded-full bg-chip px-3 py-1.5 text-[13px] font-semibold text-ink-soft">{children}</span>
}

// One tile on the "Meine Reisen" page; the whole card links to the trip's detail page
export default function TripCard({trip, index}: Readonly<TripCardProps>) {
    // The color chosen in "Neue Reise" wins; trips without a color get a pastel tone in turn
    const fallbackClass = trip.coverColor ? '' : fallbackCoverColors[index % fallbackCoverColors.length]
    const countries = getCountryCodes(trip).map((code) => getCountryName(code)).join(' · ')
    // As on the detail page: with one place, "1 Ort" and "0 km" say nothing the title does not say;
    // a base with only day trips around it has several places but no route
    const severalStops = trip.stops.length > 1
    const hasRoute = trip.routeLengthKm > 0
    const photoCount = trip.stops.reduce((sum, stop) => sum + stop.photoIds.length, 0)

    return (
        <Link
            to={`/trips/${trip.id}`}
            className="group flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-accent-soft"
        >

            {/* A photo of the trip wins; without photos the cover color is shown */}
            {trip.coverPhotoId ? (
                <AuthImage photoId={trip.coverPhotoId} alt="" className="h-37.5 w-full"/>
            ) : (
                <div
                    className={`h-37.5 ${fallbackClass}`}
                    style={trip.coverColor ? {backgroundColor: trip.coverColor} : undefined}
                />
            )}

            <div className="flex flex-col gap-2.5 px-5.5 pt-5 pb-5.5">
                <span className="text-[13px] font-semibold text-muted">
                    {formatDateRange(trip.startDate, trip.endDate)}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink group-hover:text-accent">{trip.title}</h2>
                {countries && <span className="text-[15px] font-semibold text-ink-soft">{countries}</span>}
                {trip.description && <p className="line-clamp-2 text-[15px] text-ink-soft">{trip.description}</p>}

                <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{formatDays(getTripDays(trip))}</Badge>
                    {severalStops && <Badge>{trip.stops.length} Orte</Badge>}
                    {hasRoute && <Badge>{formatKm(trip.routeLengthKm)}</Badge>}
                    {photoCount > 0 && <Badge>{photoCount === 1 ? '1 Foto' : `${photoCount} Fotos`}</Badge>}
                </div>
                <TagBadges tags={trip.tags}/>
            </div>
        </Link>
    )
}