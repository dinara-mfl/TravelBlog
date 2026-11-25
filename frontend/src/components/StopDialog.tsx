import {useEffect, useRef, useState, type SubmitEvent} from 'react'
import {getErrorMessage, getFieldErrors} from '../api/client'
import {addStop, updateStop} from '../api/stops'
import type {Language} from '../i18n/language'
import {useLanguage} from '../i18n/useLanguage'
import type {Place} from '../types/place'
import type {Stop, StopType, Trip} from '../types/trip'
import {getCountryName} from '../utils/countries'
import {suggestStopDate} from '../utils/dates'
import DialogHeader from './DialogHeader'
import FormField from './FormField'
import PlaceSearch from './PlaceSearch'
import StopTypeField from './StopTypeField'
import {savePhotos} from '../api/photos'
import PhotoPicker from './PhotoPicker'

type StopDialogProps = {
    open: boolean
    trip: Trip
    stop?: Stop | null // set: edit this stop; empty: add a new one
    onClose: () => void
    onSaved: (trip: Trip, warning?: string) => void
}

// The place of an existing stop, shown as selected until the user searches for another one
function toPlace(stop: Stop, language: Language): Place {
    return {
        name: stop.name,
        displayName: `${stop.name}, ${getCountryName(stop.countryCode, language)}`,
        latitude: stop.latitude,
        longitude: stop.longitude,
        countryCode: stop.countryCode,
    }
}

// Dialog to add or change a stop: search the place, then name, arrival date and note
export default function StopDialog({open, trip, stop, onClose, onSaved}: Readonly<StopDialogProps>) {
    const {t, language} = useLanguage()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [place, setPlace] = useState<Place | null>(null)
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [note, setNote] = useState('')
    const [type, setType] = useState<StopType>('OVERNIGHT')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [keptPhotoIds, setKeptPhotoIds] = useState<string[]>([])
    const [newFiles, setNewFiles] = useState<File[]>([])
    // Changes every time the dialog opens, so that the place search starts empty again
    const [searchKey, setSearchKey] = useState(0)

    // The native <dialog> handles focus, Esc and the backdrop
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) {
            setPlace(stop ? toPlace(stop, language) : null)
            setName(stop?.name ?? '')
            setDate(stop?.date ?? suggestStopDate(trip))
            setNote(stop?.note ?? '')
            setType(stop?.type ?? 'OVERNIGHT')
            setKeptPhotoIds(stop?.photoIds ?? [])
            setNewFiles([])
            setFieldErrors({})
            setError('')
            setSearchKey((key) => key + 1)
            dialog.showModal()
        }
        if (!open && dialog.open) {
            dialog.close()
        }
    }, [open, stop, trip, language])

    // A new place also sets the name; the user can still change it, e.g. "Florenz" → "Florenz (Altstadt)"
    function handleSelect(selected: Place) {
        setPlace(selected)
        setName(selected.name)
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setFieldErrors({})
        setError('')

        if (!place) {
            setFieldErrors({place: t.tripDialog.placeRequired})
            return
        }

        setSubmitting(true)
        try {
            const request = {
                name: name.trim(),
                latitude: place.latitude,
                longitude: place.longitude,
                countryCode: place.countryCode,
                date,
                note,
                type,
            }
            const saved = stop
                ? await updateStop(trip.id, stop.id, request)
                : await addStop(trip.id, request)
            const stopId = stop?.id ?? saved.stops.find((s) => !trip.stops.some((old) => old.id === s.id))?.id
            const removedPhotoIds = (stop?.photoIds ?? []).filter((id) => !keptPhotoIds.includes(id))

            if (!stopId || (removedPhotoIds.length === 0 && newFiles.length === 0)) {
                onSaved(saved)
                return
            }
            setUploading(true)
            const result = await savePhotos(trip.id, stopId, removedPhotoIds, newFiles)
            onSaved(result.trip ?? saved, result.failed > 0 ? t.photos.saveWarning(result.failed) : undefined)
        } catch (err) {
            setFieldErrors(getFieldErrors(err))
            setError(getErrorMessage(err, t.stopDialog.saveError))
        } finally {
            setSubmitting(false)
            setUploading(false)
        }
    }

    // Errors of the coordinates or the country belong to the place search
    const placeError = fieldErrors.place ?? fieldErrors.latitude ?? fieldErrors.longitude ?? fieldErrors.countryCode

    let submitLabel = t.common.save
    if (uploading) submitLabel = t.common.uploadingPhotos
    else if (submitting) submitLabel = t.common.saving

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            aria-labelledby="stop-dialog-title"
            className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-surface p-0 text-ink shadow-card backdrop:bg-black/50"
        >
            <DialogHeader
                titleId="stop-dialog-title"
                title={stop ? t.stopDialog.editTitle : t.stopDialog.newTitle}
                onClose={onClose}
            />
            <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5 px-6 pb-6 sm:px-8 sm:pb-8">

                <PlaceSearch key={searchKey} selected={place} onSelect={handleSelect} error={placeError}/>

                {place && (
                    <>
                        <FormField
                            id="stop-name"
                            label={t.stopDialog.name}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={fieldErrors.name}
                            required
                        />
                        <FormField
                            id="stop-date"
                            label={t.stopDialog.arrival}
                            type="date"
                            min={trip.startDate}
                            max={trip.endDate}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            error={fieldErrors.date}
                            required
                        />
                        <StopTypeField name="stop-type" value={type} onChange={setType}/>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="stop-note" className="text-sm font-semibold text-ink-soft">
                                <span>{t.stopDialog.note}</span>{' '}
                                <span className="font-normal text-muted">{t.common.optional}</span>
                            </label>
                            <textarea
                                id="stop-note"
                                rows={3}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t.stopDialog.notePlaceholder}
                                className="rounded-xl border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent-soft"
                            />
                        </div>
                        <PhotoPicker
                            existingPhotoIds={keptPhotoIds}
                            files={newFiles}
                            onExistingChange={setKeptPhotoIds}
                            onFilesChange={setNewFiles}
                        />
                    </>
                )}

                {error && (
                    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                        {error}
                    </p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-12 cursor-pointer rounded-full px-5 text-[15px] font-semibold text-muted hover:text-ink"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="min-h-12 cursor-pointer rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark disabled:cursor-default disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </dialog>
    )
}
