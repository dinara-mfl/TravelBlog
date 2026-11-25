import {useEffect, useRef, useState, type KeyboardEvent} from 'react'
import {getErrorMessage} from '../api/client'
import {deletePhoto} from '../api/photos'
import {setCover} from '../api/trips'
import {useLanguage} from '../i18n/useLanguage'
import type {Trip} from '../types/trip'
import AuthImage from './AuthImage'
import ConfirmDialog from './ConfirmDialog'

type PhotoLightboxProps = {
    trip: Trip
    stopId: string
    startIndex: number
    onClose: () => void
    onTripChange: (trip: Trip) => void
}

const roundButton = 'flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30 disabled:invisible'
const actionButton = 'min-h-11 cursor-pointer rounded-full px-5 text-sm font-semibold disabled:cursor-default disabled:opacity-60'

export default function PhotoLightbox({trip, stopId, startIndex, onClose, onTripChange}: Readonly<PhotoLightboxProps>) {
    const {t} = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [index, setIndex] = useState(startIndex)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const stop = trip.stops.find((candidate) => candidate.id === stopId)
    const photoIds = stop?.photoIds ?? []
    const photoId = photoIds[Math.min(index, photoIds.length - 1)]
    const position = photoIds.indexOf(photoId)
    const isCover = trip.coverPhotoId === photoId

    useEffect(() => {
        dialogRef.current?.showModal()
    }, [])

    useEffect(() => {
        if (!photoId) onClose()
    }, [photoId, onClose])

    function show(newPosition: number) {
        setError('')
        setIndex(Math.max(0, Math.min(newPosition, photoIds.length - 1)))
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
        if (confirmDelete) return
        if (event.key === 'ArrowLeft') show(position - 1)
        if (event.key === 'ArrowRight') show(position + 1)
    }

    async function makeCover() {
        setBusy(true)
        setError('')
        try {
            onTripChange(await setCover(trip.id, photoId))
        } catch (err) {
            setError(getErrorMessage(err, t.lightbox.coverError))
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete() {
        setConfirmDelete(false)
        setBusy(true)
        setError('')
        try {
            onTripChange(await deletePhoto(trip.id, stopId, photoId))
        } catch (err) {
            setError(getErrorMessage(err, t.lightbox.deleteError))
        } finally {
            setBusy(false)
        }
    }

    if (!stop || !photoId) return null

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onKeyDown={handleKeyDown}
            aria-label={t.lightbox.label(stop.name)}
            className="m-auto h-full max-h-none w-full max-w-none bg-slate-950 p-0 text-white backdrop:bg-black/60"
        >
            <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                        <span>{stop.name}</span>{' '}
                        <span className="text-white/70">· {t.lightbox.position(position + 1, photoIds.length)}</span>
                    </p>
                    <button type="button" onClick={onClose} className={roundButton}>
                        <span aria-hidden="true">×</span>
                        <span className="sr-only">{t.common.close}</span>
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 items-center gap-2 sm:gap-4">
                    <button type="button" onClick={() => show(position - 1)} disabled={position === 0} className={roundButton}>
                        <span aria-hidden="true">‹</span>
                        <span className="sr-only">{t.lightbox.previous}</span>
                    </button>
                    <div className="flex h-full min-w-0 flex-1 items-center justify-center">
                        <AuthImage
                            key={photoId}
                            photoId={photoId}
                            alt={`${stop.name}, ${t.common.photo(position + 1)}`}
                            className="max-h-full max-w-full rounded-xl object-contain!"
                        />
                    </div>
                    <button type="button" onClick={() => show(position + 1)} disabled={position === photoIds.length - 1} className={roundButton}>
                        <span aria-hidden="true">›</span>
                        <span className="sr-only">{t.lightbox.next}</span>
                    </button>
                </div>

                {error && <p role="alert" className="text-center text-sm text-red-300">{error}</p>}

                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => void makeCover()}
                        disabled={busy || isCover}
                        className={`${actionButton} bg-white text-slate-900 hover:bg-white/85`}
                    >
                        {isCover ? t.lightbox.isCover : t.lightbox.makeCover}
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        disabled={busy}
                        className={`${actionButton} text-red-300 hover:bg-white/10`}
                    >
                        {t.lightbox.deletePhoto}
                    </button>
                </div>
            </div>

            {/* Inside the <dialog>, otherwise the question would lie behind it */}
            {confirmDelete && (
                <ConfirmDialog
                    title={t.lightbox.deleteTitle}
                    message={t.lightbox.deleteMessage}
                    confirmLabel={t.common.delete}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </dialog>
    )
}