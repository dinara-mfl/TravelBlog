import axios from 'axios'
import {useEffect, useState} from 'react'
import {Link, useParams, useNavigate, useLocation} from 'react-router-dom'
import {getErrorMessage} from '../api/client'
import {getTrip, deleteTrip} from '../api/trips'
import TagBadges from '../components/TagBadges'
import TripDialog from '../components/TripDialog'
import TripStops from '../components/TripStops'
import TripDetailSkeleton from '../components/skeletons/TripDetailSkeleton'
import {useLanguage} from '../i18n/useLanguage'
import type {Trip} from '../types/trip'
import {formatDateRange} from '../utils/dates'
import ConfirmDialog from '../components/ConfirmDialog'

function BackLink() {
    const {t} = useLanguage()
    return (
        <Link to="/trips" className="flex w-fit items-center gap-1.5 text-[15px] font-semibold text-muted hover:text-ink">
            <span aria-hidden="true">‹</span>
            <span>{t.tripDetail.back}</span>
        </Link>
    )
}

export default function TripDetailPage() {
    const {t, language} = useLanguage()
    const {id} = useParams()
    const [trip, setTrip] = useState<Trip | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const location = useLocation()
    const [error, setError] = useState<string>((location.state as { notice?: string } | null)?.notice ?? '')
    // The trip could not be loaded; its text is made when it is shown, so it follows a change of the language
    const [loadError, setLoadError] = useState<unknown>(null)
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
                    setLoadError(err)
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
            setError(getErrorMessage(err, t.tripDetail.deleteError))
        }
    }

    if (loading) {
        return <TripDetailSkeleton/>
    }

    if (notFound || !trip) {
        const loadErrorText = loadError ? getErrorMessage(loadError, t.tripDetail.loadError) : error
        return (
            <div className="flex flex-col gap-6">
                <BackLink/>
                {loadErrorText ? (
                    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{loadErrorText}</p>
                ) : (
                    <section className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                        <h1 className="text-xl font-bold">{t.tripDetail.notFoundTitle}</h1>
                        <p className="max-w-md text-muted">{t.tripDetail.notFoundText}</p>
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
                    <p className="text-[15px] font-semibold text-muted">{formatDateRange(trip.startDate, trip.endDate, language)}</p>
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
                        className="min-h-12 cursor-pointer rounded-full px-5 text-[15px] font-semibold text-danger hover:bg-danger-soft"
                    >
                        {t.common.delete}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditOpen(true)}
                        className="min-h-12 cursor-pointer rounded-full border border-line-strong bg-surface px-6 text-[15px] font-semibold text-ink hover:bg-page"
                    >
                        {t.common.edit}
                    </button>
                </div>
            </section>

            {error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
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
                    title={t.tripDetail.deleteTitle}
                    message={t.tripDetail.deleteMessage(trip.title)}
                    confirmLabel={t.common.delete}
                    onConfirm={() => void handleDelete(trip)}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    )
}