import {useEffect, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {getErrorMessage} from '../api/client'
import {getTrips} from '../api/trips'
import TripDialog from '../components/TripDialog'
import TripCard from '../components/TripCard'
import TripFilters from '../components/TripFilters'
import type {Trip, TripTag} from '../types/trip'
import {ALL_YEARS, filterTrips, getYears} from '../utils/tripFilters'

export default function TripsPage() {
    const navigate = useNavigate()
    // The statistics page links here with ?year=2024 to show the trips of one year
    const [searchParams] = useSearchParams()
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [year, setYear] = useState(searchParams.get('year') ?? ALL_YEARS)
    const [selectedTags, setSelectedTags] = useState<TripTag[]>([])

    // Load the trips once when the page opens
    useEffect(() => {
        let cancelled = false // ignore the answer if the page was left in the meantime
        getTrips()
            .then((data) => {
                if (!cancelled) setTrips(data)
            })
            .catch((err) => {
                if (!cancelled) setError(getErrorMessage(err, 'Deine Reisen konnten nicht geladen werden.'))
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    const shownTrips = filterTrips(trips, query, year, selectedTags)

    function resetFilters() {
        setQuery('')
        setYear(ALL_YEARS)
        setSelectedTags([])
    }

    function handleCreated(trip: Trip, warning?: string) {
        setDialogOpen(false)
        void navigate(`/trips/${trip.id}`, {state: {notice: warning}})
    }

    return (
        <div className="flex flex-col gap-7">
            <section className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-4xl font-bold tracking-tight">Meine Reisen</h1>
                    <p className="text-muted">Alle Reisen an einem Ort – mit Karte, Fotos und Eindrücken.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark"
                >
                    <span aria-hidden="true" className="text-xl leading-none">+</span>
                    <span>Neue Reise</span>
                </button>
            </section>

            {loading && <p className="text-muted">Reisen werden geladen …</p>}

            {!loading && error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {!loading && !error && trips.length === 0 && (
                <section className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                    <h2 className="text-xl font-bold">Noch keine Reisen</h2>
                    <p className="max-w-md text-muted">
                        Sobald du deine erste Reise anlegst, erscheint sie hier.
                    </p>
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
                            <h2 className="text-xl font-bold">Keine Reisen gefunden</h2>
                            <p className="max-w-md text-muted">Ändere den Suchbegriff, das Jahr oder die Tags.</p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-1 min-h-11 cursor-pointer rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink hover:border-accent"
                            >
                                Filter zurücksetzen
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

            <TripDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={handleCreated}/>
        </div>
    )
}