import {useEffect, useState} from 'react'
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import {getErrorMessage} from '../api/client'
import {getTrips} from '../api/trips'
import TripDialog from '../components/TripDialog'
import TripCard from '../components/TripCard'
import TripFilters from '../components/TripFilters'
import TripCardsSkeleton from '../components/skeletons/TripCardsSkeleton'
import {useLanguage} from '../i18n/useLanguage'
import type {Trip, TripDraft, TripTag} from '../types/trip'
import {ALL_YEARS, filterTrips, getYears} from '../utils/tripFilters'

// "Reise planen" on the wishlist comes here with the wish in the router state: {tripDraft: {...}}
function readTripDraft(state: unknown): TripDraft | null {
    const draft = (state as {tripDraft?: TripDraft} | null)?.tripDraft
    return draft ?? null
}

export default function TripsPage() {
    const {t, language} = useLanguage()
    const navigate = useNavigate()
    const location = useLocation()
    // The statistics page links here with ?year=2024 to show the trips of one year
    const [searchParams] = useSearchParams()
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<unknown>(null)
    // The planned wish, if the page was opened with "Reise planen"; the dialog then opens at once with its values
    const [tripDraft, setTripDraft] = useState<TripDraft | null>(() => readTripDraft(location.state))
    const [dialogOpen, setDialogOpen] = useState(tripDraft !== null)
    const [query, setQuery] = useState('')
    const [year, setYear] = useState(searchParams.get('year') ?? ALL_YEARS)
    const [selectedTags, setSelectedTags] = useState<TripTag[]>([])

    // The wish is only needed once: remove it from the browser history,
    // so that reloading the page does not open the dialog again
    useEffect(() => {
        if (readTripDraft(location.state)) {
            void navigate(`${location.pathname}${location.search}`, {replace: true, state: null})
        }
    }, [location, navigate])

    // Load the trips once when the page opens
    useEffect(() => {
        let cancelled = false // ignore the answer if the page was left in the meantime
        getTrips()
            .then((data) => {
                if (!cancelled) setTrips(data)
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    // The text is made here and not when the error happens, so it follows a change of the language
    const error = loadError ? getErrorMessage(loadError, t.trips.loadError) : ''

    const shownTrips = filterTrips(trips, query, year, selectedTags, language)

    function resetFilters() {
        setQuery('')
        setYear(ALL_YEARS)
        setSelectedTags([])
    }

    // "Neue Reise" always starts with an empty form, also after a planned wish
    function openEmptyDialog() {
        setTripDraft(null)
        setDialogOpen(true)
    }

    function handleCreated(trip: Trip, warning?: string) {
        setDialogOpen(false)
        void navigate(`/trips/${trip.id}`, {state: {notice: warning}})
    }

    return (
        <div className="flex flex-col gap-7">
            <section className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl font-bold tracking-tight">{t.trips.title}</h1>
                    <p className="text-muted">{t.trips.subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={openEmptyDialog}
                    className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark"
                >
                    <span aria-hidden="true" className="text-xl leading-none">+</span>
                    <span>{t.trips.newTrip}</span>
                </button>
            </section>

            {loading && <TripCardsSkeleton/>}

            {!loading && error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}

            {!loading && !error && trips.length === 0 && (
                <section className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                    <h2 className="text-xl font-bold">{t.trips.emptyTitle}</h2>
                    <p className="max-w-md text-muted">{t.trips.emptyText}</p>
                </section>
            )}

            {!loading && !error && trips.length > 0 && (
                <>
                    <TripFilters
                        query={query}
                        onQueryChange={setQuery}
                        years={getYears(trips)}
                        selectedYear={year}
                        onYearChange={setYear}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        resultCount={shownTrips.length}
                    />

                    {shownTrips.length === 0 ? (
                        <section className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                            <h2 className="text-xl font-bold">{t.trips.noResultsTitle}</h2>
                            <p className="max-w-md text-muted">{t.trips.noResultsText}</p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-1 min-h-11 cursor-pointer rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink hover:border-accent"
                            >
                                {t.trips.resetFilters}
                            </button>
                        </section>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
                            {shownTrips.map((trip) => (
                                // The index in the full list keeps each card's fallback color while filtering
                                <TripCard key={trip.id} trip={trip} index={trips.indexOf(trip)}/>
                            ))}
                        </div>
                    )}
                </>
            )}

            <TripDialog
                open={dialogOpen}
                draft={tripDraft}
                onClose={() => setDialogOpen(false)}
                onSaved={handleCreated}
            />
        </div>
    )
}