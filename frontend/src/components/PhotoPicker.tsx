import {useEffect, useMemo, useState, type ChangeEvent} from 'react'
import {MAX_PHOTOS_PER_STOP} from '../api/photos'
import AuthImage from './AuthImage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type PhotoPickerProps = {
    files: File[] // new photos, uploaded after the stop is saved
    onFilesChange: (files: File[]) => void
    existingPhotoIds?: string[] // photos already saved for the stop; a new stop has none
    onExistingChange?: (photoIds: string[]) => void
}

// Chooses up to 5 photos of a stop. Nothing is uploaded or deleted here: that happens on "Speichern".
export default function PhotoPicker({files, onFilesChange, existingPhotoIds = [], onExistingChange}: Readonly<PhotoPickerProps>) {
    const [error, setError] = useState('')
    const free = MAX_PHOTOS_PER_STOP - existingPhotoIds.length - files.length

    // Local previews of the chosen files, freed again when the files change
    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

    function handleChoose(event: ChangeEvent<HTMLInputElement>) {
        const chosen = Array.from(event.target.files ?? [])
        event.target.value = '' // so that the same file can be chosen again after removing it
        setError('')

        const photos = chosen.filter((file) => ALLOWED_TYPES.includes(file.type))
        if (photos.length < chosen.length) {
            setError('Bitte nur Fotos im Format JPEG, PNG oder WebP wählen.')
        }
        if (photos.length > free) {
            setError(`Pro Ort sind höchstens ${MAX_PHOTOS_PER_STOP} Fotos möglich.`)
        }
        onFilesChange([...files, ...photos.slice(0, free)])
    }

    const thumb = 'size-20 rounded-xl'
    const removeButton = 'absolute -right-2 -top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-ink text-sm font-bold text-white hover:bg-red-700'

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink-soft">
                Fotos <span className="font-normal text-muted">(optional, höchstens {MAX_PHOTOS_PER_STOP})</span>
            </span>
            <ul className="flex flex-wrap gap-3">
                {existingPhotoIds.map((photoId, index) => (
                    <li key={photoId} className="relative">
                        <AuthImage photoId={photoId} alt={`Foto ${index + 1}`} className={thumb}/>
                        <button
                            type="button"
                            onClick={() => onExistingChange?.(existingPhotoIds.filter((id) => id !== photoId))}
                            className={removeButton}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Foto {index + 1} entfernen</span>
                        </button>
                    </li>
                ))}
                {files.map((file, index) => (
                    <li key={previews[index]} className="relative">
                        <img src={previews[index]} alt={file.name} className={`${thumb} object-cover`}/>
                        <button
                            type="button"
                            onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                            className={removeButton}
                        >
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">{file.name} entfernen</span>
                        </button>
                    </li>
                ))}
                {free > 0 && (
                    <li>
                        <label className={`${thumb} flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-line-strong text-muted hover:border-accent hover:text-accent focus-within:border-accent`}>
                            <span aria-hidden="true" className="text-2xl leading-none">+</span>
                            <span className="text-xs font-semibold">Foto</span>
                            <input
                                type="file"
                                accept={ALLOWED_TYPES.join(',')}
                                multiple
                                onChange={handleChoose}
                                className="sr-only"
                            />
                        </label>
                    </li>
                )}
            </ul>
            {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
    )
}