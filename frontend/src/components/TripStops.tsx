import {Fragment, useState} from 'react'
import {getErrorMessage} from '../api/client'
import {deleteStop} from '../api/stops'
import type {Language} from '../i18n/language'
import {texts} from '../i18n/texts'
import {useLanguage} from '../i18n/useLanguage'
import type {Stop, Trip} from '../types/trip'
import {getCountryName} from '../utils/countries'
import {formatStay} from '../utils/dates'
import {formatKm} from '../utils/tripFilters'
import AuthImage from './AuthImage'
import ConfirmDialog from './ConfirmDialog'
import PhotoLightbox from './PhotoLightbox'
import StopDialog from './StopDialog'
import TripMap from './TripMap'
import WikipediaInfo from './WikipediaInfo'

type TripStopsProps = {
    trip: Trip
    onTripChange: (trip: Trip) => void // after a stop was added, changed or deleted
}

const smallButton = 'min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold'

// The text on the arrow before a stop on the route: "394 km", or "394 km ab Rom" when day trips lie in between.
// Day trips get no arrow; their distance from the base is in their badge.
function routeDistanceLabel(stops: Stop[], position: number, language: Language): string | null {
    const stop = stops[position]
    if (!stop.onRoute || stop.distanceFromPreviousKm === null) {
        return null
    }
    const km = formatKm(stop.distanceFromPreviousKm, language)
    const previousOnRoute = stops.slice(0, position).findLast((candidate) => candidate.onRoute)
    return previousOnRoute && previousOnRoute !== stops[position - 1]
        ? texts[language].stops.distanceFrom(km, previousOnRoute.name)
        : km
}

// The badge of a stop: its type, for a day trip with its base and distance, e.g. "Tagesausflug ab Rom · 26 km"
function typeLabel(stops: Stop[], stop: Stop, language: Language): string {
    const label = texts[language].stopTypes.labels[stop.type]
    const base = stops.find((candidate) => candidate.id === stop.baseStopId)
    if (!base || stop.distanceFromPreviousKm === null) {
        return label
    }
    return texts[language].stops.dayTripFrom(label, base.name, formatKm(stop.distanceFromPreviousKm, language))
}

// "Reiseverlauf" on the trip detail page, as in the mockup: the map on the left and the stops on the right
// (one below the other on narrow screens), in the order of the visit with the distances between them,
// and adding, changing and deleting stops
export default function TripStops({trip, onTripChange}: Readonly<TripStopsProps>) {
    const {t, language} = useLanguage()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [stopToEdit, setStopToEdit] = useState<Stop | null>(null)
    const [stopToDelete, setStopToDelete] = useState<Stop | null>(null)
    const [error, setError] = useState('')
    const [viewing, setViewing] = useState<{ stopId: string; index: number } | null>(null)

    function openNew() {
        setStopToEdit(null)
        setDialogOpen(true)
    }

    function openEdit(stop: Stop) {
        setStopToEdit(stop)
        setDialogOpen(true)
    }

    async function handleDelete(stop: Stop) {
        setStopToDelete(null)
        setError('')
        try {
            onTripChange(await deleteStop(trip.id, stop.id))
        } catch (err) {
            setError(getErrorMessage(err, t.stops.deleteError))
        }
    }

    return (
        <section aria-labelledby="stops-title" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="stops-title" className="text-2xl font-bold tracking-tight">{t.stops.title}</h2>
                <button
                    type="button"
                    onClick={openNew}
                    className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark"
                >
                    <span aria-hidden="true" className="text-xl leading-none">+</span>
                    <span>{t.stops.add}</span>
                </button>
            </div>

            {error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {trip.stops.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-12 text-center shadow-card">
                    <h3 className="text-xl font-bold">{t.stops.emptyTitle}</h3>
                    <p className="max-w-md text-muted">{t.stops.emptyText}</p>
                </div>
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    {/* Sticky, so the map stays in view while the user scrolls through a long list of places */}
                    <TripMap stops={trip.stops} routeLengthKm={trip.routeLengthKm} className="lg:sticky lg:top-6"/>
                    <ol className="flex flex-col gap-3">
                        {trip.stops.map((stop, position) => {
                            const distanceLabel = routeDistanceLabel(trip.stops, position, language)
                            return (
                                <Fragment key={stop.id}>
                                    {distanceLabel && (
                                        <li aria-hidden="true" className="flex items-center gap-2 pl-6 text-sm font-semibold text-muted">
                                            <span>↓</span>
                                            <span>{distanceLabel}</span>
                                        </li>
                                    )}
                                    <li>
                                        <article className="flex flex-col gap-3 rounded-card bg-surface px-6 py-5 shadow-card">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                {/* The number shows the order of the visit, so a single place has none */}
                                                {trip.stops.length > 1 && (
                                                    <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                                                        {position + 1}
                                                    </span>
                                                )}
                                                <h3 className="text-xl font-bold tracking-tight">{stop.name}</h3>
                                                <span className="text-sm font-semibold text-muted">
                                                    {formatStay(stop.date, stop.departureDate, language)} · {getCountryName(stop.countryCode, language)}
                                                </span>
                                                <span className="rounded-full bg-chip px-3 py-1 text-[13px] font-semibold text-ink-soft">
                                                    {typeLabel(trip.stops, stop, language)}
                                                </span>
                                            </div>
                                            {stop.note && <p className="text-ink-soft">{stop.note}</p>}
                                            {stop.photoIds.length > 0 && (
                                                <ul className="flex flex-wrap gap-2">
                                                    {stop.photoIds.map((photoId, index) => (
                                                        <li key={photoId} className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewing({stopId: stop.id, index})}
                                                                className="block cursor-pointer overflow-hidden rounded-xl focus-visible:outline-4 focus-visible:outline-accent-soft"
                                                            >
                                                                <AuthImage
                                                                    photoId={photoId}
                                                                    alt={t.stops.photoAlt(stop.name, index + 1)}
                                                                    className="size-20 transition hover:scale-105"
                                                                />
                                                            </button>
                                                            {photoId === trip.coverPhotoId && (
                                                                <span className="pointer-events-none absolute bottom-1 left-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                                    {t.stops.cover}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {/* A new component when the place, the type or the language changes, so it loads again */}
                                            <WikipediaInfo
                                                key={`${stop.name}|${stop.latitude}|${stop.longitude}|${stop.type}|${language}`}
                                                stop={stop}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(stop)}
                                                    className={`${smallButton} border border-line-strong text-ink hover:border-accent`}
                                                >
                                                    {t.common.edit}<span className="sr-only">: {stop.name}</span>
                                                </button>
                                                {/* A trip keeps at least one place; the last one can only be changed */}
                                                {trip.stops.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setStopToDelete(stop)}
                                                        className={`${smallButton} text-danger hover:bg-danger-soft`}
                                                    >
                                                        {t.common.delete}<span className="sr-only">: {stop.name}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    </li>
                                </Fragment>
                            )
                        })}
                    </ol>
                </div>
            )}

            <StopDialog
                open={dialogOpen}
                trip={trip}
                stop={stopToEdit}
                onClose={() => setDialogOpen(false)}
                onSaved={(saved, warning) => {
                    onTripChange(saved)
                    setError(warning ?? '')
                    setDialogOpen(false)
                }}
            />
            
            {viewing && (
                <PhotoLightbox
                    trip={trip}
                    stopId={viewing.stopId}
                    startIndex={viewing.index}
                    onClose={() => setViewing(null)}
                    onTripChange={onTripChange}
                />
            )}

            {stopToDelete && (
                <ConfirmDialog
                    title={t.stops.deleteTitle}
                    message={t.stops.deleteMessage(stopToDelete.name)}
                    confirmLabel={t.common.delete}
                    onConfirm={() => void handleDelete(stopToDelete)}
                    onCancel={() => setStopToDelete(null)}
                />
            )}
        </section>
    )
}
