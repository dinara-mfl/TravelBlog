import {useEffect, useRef, useState, type SubmitEvent} from 'react'
import {getErrorMessage, getFieldErrors} from '../api/client'
import {createTrip, setCover, updateTrip} from '../api/trips'
import {TRIP_TAG_LABELS, TRIP_TAGS, type StopType, type Trip, type TripTag} from '../types/trip'
import type {Place} from '../types/place'
import {COVER_COLORS, DEFAULT_COVER_COLOR} from '../coverColors'
import FormField from './FormField'
import PlaceSearch from './PlaceSearch'
import StopTypeField from './StopTypeField'
import {photoWarning, savePhotos} from '../api/photos'
import PhotoPicker from './PhotoPicker'
import AuthImage from './AuthImage'

type TripDialogProps = {
    open: boolean
    trip?: Trip | null
    onClose: () => void
    onSaved: (trip: Trip, warning?: string) => void
}

type TripForm = {
    title: string
    description: string
    startDate: string
    endDate: string
    coverColor: string
    tags: TripTag[]
}

const EMPTY_FORM: TripForm = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    coverColor: DEFAULT_COVER_COLOR,
    tags: [],
}

function toForm(trip: Trip): TripForm {
    return {
        title: trip.customTitle ?? '', // empty: the title is built from the places
        description: trip.description ?? '',
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverColor: trip.coverColor ?? DEFAULT_COVER_COLOR,
        tags: trip.tags,
    }
}

export default function TripDialog({open, trip, onClose, onSaved}: Readonly<TripDialogProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    // Only for a new trip: its first place, because every trip has at least one
    const [place, setPlace] = useState<Place | null>(null)
    // null: not chosen yet, then the first place of a trip of several days counts as an overnight stay
    const [typeChoice, setTypeChoice] = useState<StopType | null>(null)
    // Changes every time the dialog opens, so that the place search starts empty again
    const [searchKey, setSearchKey] = useState(0)
    const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)

    // The native <dialog> handles focus, Esc and the backdrop
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) {
            setForm(trip ? toForm(trip) : EMPTY_FORM)
            setFieldErrors({})
            setError('')
            setPlace(null)
            setTypeChoice(null)
            setFiles([])
            setCoverPhotoId(trip?.coverPhotoId ?? null)
            setSearchKey((key) => key + 1)
            dialog.showModal()
        }
        if (!open && dialog.open) {
            dialog.close()
        }
    }, [open, trip])

    function update(field: Exclude<keyof TripForm, 'tags'>, value: string) {
        setForm({...form, [field]: value})
    }

    // Clicking a tag selects it; clicking it again removes it
    function toggleTag(tag: TripTag) {
        const tags = form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]
        setForm({...form, tags})
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setFieldErrors({})
        setError('')

        if (form.startDate && form.endDate && form.endDate < form.startDate) {
            setFieldErrors({endDate: 'Das Enddatum darf nicht vor dem Startdatum liegen.'})
            return
        }

        if (!trip && !place) {
            setFieldErrors({place: 'Bitte einen Ort suchen und auswählen.'})
            return
        }

        setSubmitting(true)
        try {
            const firstStop = place
                ? {
                    name: place.name,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    countryCode: place.countryCode,
                    type: firstStopType,
                }
                : undefined
            const request = {...form, title: form.title.trim(), firstStop}
            if (trip) {
                const updated = await updateTrip(trip.id, request)
                // The cover has its own endpoint; it is only called when the user chose another photo
                const coverChanged = coverPhotoId !== null && coverPhotoId !== trip.coverPhotoId
                onSaved(coverChanged ? await setCover(trip.id, coverPhotoId) : updated)
                return
            }
            const created = await createTrip(request)
            if (files.length === 0) {
                onSaved(created)
                return
            }
            setUploading(true)
            const result = await savePhotos(created.id, created.stops[0].id, [], files)
            onSaved(result.trip ?? created, photoWarning(result.failed))
        } catch (err) {
            setFieldErrors(getFieldErrors(err))
            setError(getErrorMessage(err, 'Die Reise konnte nicht gespeichert werden.'))
        } finally {
            setSubmitting(false)
            setUploading(false)
        }
    }

    let firstStopType: StopType = 'DAY_TRIP'
    if (typeChoice) {
        firstStopType = typeChoice
    } else if (form.endDate > form.startDate) {
        firstStopType = 'OVERNIGHT'
    }
    // Errors of the coordinates or the country belong to the place search
    const placeError = fieldErrors.place
        ?? fieldErrors['firstStop.name']
        ?? fieldErrors['firstStop.latitude']
        ?? fieldErrors['firstStop.longitude']
        ?? fieldErrors['firstStop.countryCode']

    const tripPhotoIds = trip ? trip.stops.flatMap((stop) => stop.photoIds) : []

    let submitLabel = 'Speichern'
    if (uploading) submitLabel = 'Fotos werden hochgeladen …'
    else if (submitting) submitLabel = 'Wird gespeichert …'

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            aria-labelledby="trip-dialog-title"
            className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-surface p-0 text-ink shadow-card backdrop:bg-ink/40"
        >
            <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5 p-6 sm:p-8">
                <h2 id="trip-dialog-title" className="text-2xl font-bold tracking-tight">
                    {trip ? 'Reise bearbeiten' : 'Neue Reise'}
                </h2>

                {!trip && (
                    <>
                        <PlaceSearch key={searchKey} selected={place} onSelect={setPlace} error={placeError}/>
                        {place && (
                            <StopTypeField name="trip-first-stop-type" value={firstStopType} onChange={setTypeChoice}/>
                        )}
                        {place && <PhotoPicker files={files} onFilesChange={setFiles}/>}
                        <p className="-mt-2 text-sm text-muted">Weitere Orte fügst du danach auf der Seite der Reise hinzu.</p>
                    </>
                )}

                <FormField
                    id="trip-title"
                    label={<>Titel <span className="font-normal text-muted">(optional)</span></>}
                    placeholder={trip && !trip.customTitle ? trip.title : 'Leer lassen – wird aus den Orten erstellt'}
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    error={fieldErrors.title}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        id="trip-start"
                        label="Von"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => update('startDate', e.target.value)}
                        error={fieldErrors.startDate}
                        required
                    />
                    <FormField
                        id="trip-end"
                        label="Bis"
                        type="date"
                        min={form.startDate || undefined}
                        value={form.endDate}
                        onChange={(e) => update('endDate', e.target.value)}
                        error={fieldErrors.endDate}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="trip-description" className="text-sm font-semibold text-ink-soft">
                        Beschreibung <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <textarea
                        id="trip-description"
                        rows={3}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className="rounded-xl border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
                    />
                </div>

                {tripPhotoIds.length > 0 && (
                    <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-sm font-semibold text-ink-soft">Titelbild</legend>
                        <div className="flex flex-wrap gap-3">
                            {tripPhotoIds.map((photoId, index) => (
                                <label key={photoId} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coverPhoto"
                                        value={photoId}
                                        checked={coverPhotoId === photoId}
                                        onChange={() => setCoverPhotoId(photoId)}
                                        className="peer sr-only"
                                    />
                                    <AuthImage
                                        photoId={photoId}
                                        alt={`Foto ${index + 1}`}
                                        className="size-16 rounded-xl peer-checked:ring-4 peer-checked:ring-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                                    />
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-semibold text-ink-soft">
                        Farbe der Titelkarte
                        {tripPhotoIds.length > 0 && <span className="font-normal text-muted"> (nur für Reisen ohne Fotos)</span>}
                    </legend>
                    
                    <div className="flex flex-wrap gap-3">
                        {COVER_COLORS.map((color) => (
                            <label key={color.value} title={color.label} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="coverColor"
                                    value={color.value}
                                    checked={form.coverColor === color.value}
                                    onChange={() => update('coverColor', color.value)}
                                    className="peer sr-only"
                                />
                                <span
                                    className="block size-10 rounded-full border border-line-strong peer-checked:ring-4 peer-checked:ring-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                                    style={{backgroundColor: color.value}}
                                />
                                <span className="sr-only">{color.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-semibold text-ink-soft">
                        Tags <span className="font-normal text-muted">(optional, mehrere möglich)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                        {TRIP_TAGS.map((tag) => {
                            const selected = form.tags.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => toggleTag(tag)}
                                    className={`min-h-11 cursor-pointer rounded-full border px-4.5 text-sm font-semibold ${
                                        selected
                                            ? 'border-accent bg-accent text-white'
                                            : 'border-line-strong bg-surface text-ink hover:border-accent'
                                    }`}
                                >
                                    {TRIP_TAG_LABELS[tag]}
                                </button>
                            )
                        })}
                    </div>
                </fieldset>

                {error && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-12 cursor-pointer rounded-full px-5 text-[15px] font-semibold text-muted hover:text-ink"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="min-h-12 cursor-pointer rounded-full bg-accent px-6 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark disabled:cursor-default disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </dialog>
    )
}