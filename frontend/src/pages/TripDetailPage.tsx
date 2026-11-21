import axios from 'axios'
import {useEffect, useState} from 'react'
import {Link, useParams, useNavigate, useLocation} from 'react-router-dom'
import {getErrorMessage} from '../api/client'
import {getTrip, deleteTrip} from '../api/trips'
import TagBadges from '../components/TagBadges'
import TripDialog from '../components/TripDialog'
import TripStops from '../components/TripStops'
import type {Trip} from '../types/trip'
import {formatDateRange} from '../utils/dates'
import ConfirmDialog from '../components/ConfirmDialog'

function BackLink() {
    return (
        <Link to="/trips" className="flex w-fit items-center gap-1.5 text-[15px] font-semibold text-muted hover:text-ink">
            <span aria-hidden="true">‹</span>
            <span>Meine Reisen</span>
        </Link>
    )
}

export default function TripDetailPage() {
    const {id} = useParams()
    const [trip, setTrip] = useState<Trip | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const location = useLocation()
    const [error, setError] = useState<string>((location.state as { notice?: string } | null)?.notice ?? '')
    const [editOpen, setEditOpen] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) return
        let cancelled = false
        getTrip(id)
            .then((data) => {
                if (!cancelled) setTrip(data)
            })
            .catch((err) => {
                if (cancelled) return
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setNotFound(true)
                } else {
                    setError(getErrorMessage(err, 'Die Reise konnte nicht geladen werden.'))
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [id])

    async function handleDelete(tripToDelete: Trip) {
        setConfirmDelete(false)
        try {
            await deleteTrip(tripToDelete.id)
            void navigate('/trips')
        } catch (err) {
            setError(getErrorMessage(err, 'Die Reise konnte nicht gelöscht werden.'))
        }
    }

    if (loading) {
        return <p className="text-muted">Reise wird geladen …</p>
    }

    if (notFound || !trip) {
        return (
            <div className="flex flex-col gap-6">
                <BackLink/>
                {error ? (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                ) : (
                    <section className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                        <h1 className="text-xl font-bold">Reise nicht gefunden</h1>
                        <p className="max-w-md text-muted">Diese Reise gibt es nicht (mehr).</p>
                    </section>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-7">
            <BackLink/>

            <section className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex max-w-2xl flex-col gap-1.5">
                    <p className="text-[15px] font-semibold text-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
                    <h1 className="text-4xl font-bold tracking-tight">{trip.title}</h1>
                    {trip.description && <p className="text-ink-soft">{trip.description}</p>}
                    <div className="mt-1.5">
                        <TagBadges tags={trip.tags}/>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="min-h-12 cursor-pointer rounded-full px-5 text-[15px] font-semibold text-red-700 hover:bg-red-50"
                    >
                        Löschen
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditOpen(true)}
                        className="min-h-12 cursor-pointer rounded-full border border-line-strong bg-surface px-6 text-[15px] font-semibold text-ink hover:bg-page"
                    >
                        Bearbeiten
                    </button>
                </div>
            </section>

            {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <TripStops trip={trip} onTripChange={setTrip}/>

            <TripDialog
                open={editOpen}
                trip={trip}
                onClose={() => setEditOpen(false)}
                onSaved={(saved) => {
                    setTrip(saved)
                    setEditOpen(false)
                }}
            />

            {confirmDelete && (
                <ConfirmDialog
                    title="Reise löschen?"
                    message={`„${trip.title}“ wird mit allen Orten endgültig gelöscht.`}
                    confirmLabel="Löschen"
                    onConfirm={() => void handleDelete(trip)}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    )
}