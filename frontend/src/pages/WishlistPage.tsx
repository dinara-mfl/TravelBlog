import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {getErrorMessage} from '../api/client'
import {addWishlistEntry, deleteWishlistEntry, getWishlistEntries, updateWishlistEntry} from '../api/wishlistApi'
import ConfirmDialog from '../components/ConfirmDialog'
import WishlistForm from '../components/WishlistForm'
import WishlistSkeleton from '../components/skeletons/WishlistSkeleton'
import type {Language} from '../i18n/language'
import {useLanguage} from '../i18n/useLanguage'
import type {TripDraft} from '../types/trip'
import type {Priority, WishlistEntry, WishlistEntryRequest} from '../types/WishlistEntry'
import {describeCountries, getContinents, getDestinationName, isNamedAfterCountries} from '../utils/countries'

// Colors of the priority badge
const PRIORITY_STYLES: Record<Priority, string> = {
    HIGH: 'bg-accent text-on-accent',
    MEDIUM: 'bg-accent-soft text-accent-dark',
    LOW: 'bg-page text-ink-soft',
}

// Sort order: the most wanted destinations come first
const PRIORITY_ORDER: Record<Priority, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
}

// The small text next to the name of an entry, as in the mockup:
// "Machu Picchu" → "Peru · Südamerika", "Patagonien" → "Argentinien, Chile · Südamerika".
// An entry that is only named after its countries shows just the continent, so the name does not appear twice:
// "Island" → "Europa".
function describeWishCountries(entry: WishlistEntry, language: Language): string {
    if (isNamedAfterCountries(entry.destination, entry.countryCodes)) {
        return getContinents(entry.countryCodes, language).join(', ')
    }
    return describeCountries(entry.countryCodes, language)
}

export default function WishlistPage() {
    const {t, language} = useLanguage()
    const navigate = useNavigate()
    const [entries, setEntries] = useState<WishlistEntry[]>([])
    const [loading, setLoading] = useState(true)
    // Loading failed; the text is made when it is shown, so it follows a change of the language
    const [loadError, setLoadError] = useState<unknown>(null)
    const [error, setError] = useState('')

    // The entry shown in the form; while this is null the form creates a new entry
    const [entryToEdit, setEntryToEdit] = useState<WishlistEntry | null>(null)
    // The entry the user wants to delete; the confirmation dialog is open while this is set
    const [entryToDelete, setEntryToDelete] = useState<WishlistEntry | null>(null)

    // "Reise planen": opens "Neue Reise" on the trips page, filled with the wish.
    // The values go in the router state, not in the address, so the user's texts do not appear in the URL.
    // The wish stays on the wishlist, because some places are worth more than one trip.
    function planTrip(entry: WishlistEntry) {
        const destination = getDestinationName(entry.destination, entry.countryCodes, language)
        const tripDraft: TripDraft = {
            title: destination,
            description: entry.reason,
            placeQuery: destination,
        }
        void navigate('/trips', {state: {tripDraft}})
    }

    // Load the wishlist once when the page opens
    useEffect(() => {
        getWishlistEntries()
            .then((loadedEntries) => setEntries(loadedEntries))
            .catch((err) => setLoadError(err))
            .finally(() => setLoading(false))
    }, [])

    async function handleAdd(request: WishlistEntryRequest) {
        const newEntry = await addWishlistEntry(request)
        setEntries([...entries, newEntry])
    }

    async function handleUpdate(id: string, request: WishlistEntryRequest) {
        const updatedEntry = await updateWishlistEntry(id, request)
        setEntries(entries.map((entry) => (entry.id === id ? updatedEntry : entry)))
        setEntryToEdit(null)
    }

    async function handleDelete(entry: WishlistEntry) {
        setEntryToDelete(null)
        setError('')
        try {
            await deleteWishlistEntry(entry.id)
            setEntries(entries.filter((existingEntry) => existingEntry.id !== entry.id))
            // The deleted entry may be the one that is open in the form
            if (entryToEdit?.id === entry.id) {
                setEntryToEdit(null)
            }
        } catch (err) {
            setError(getErrorMessage(err, t.wishlist.deleteError))
        }
    }

    const shownError = loadError ? getErrorMessage(loadError, t.wishlist.loadError) : error
    const sortedEntries = entries.toSorted(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    )

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-4xl font-bold tracking-tight">{t.wishlist.title}</h1>
                <p className="text-muted">{t.wishlist.subtitle}</p>
            </div>

            {shownError && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                    {shownError}
                </p>
            )}

            {/* As in the mockup: the list on the left, the form next to it on the right */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="flex flex-col gap-4">
                    {loading && <WishlistSkeleton/>}

                    {!loading && !shownError && entries.length === 0 && (
                        <p className="rounded-card bg-surface p-8 text-center text-muted shadow-card">
                            {t.wishlist.empty}
                        </p>
                    )}

                    <ul className="flex flex-col gap-4">
                        {sortedEntries.map((entry) => (
                            <li
                                key={entry.id}
                                className={`flex flex-col gap-3 rounded-card bg-surface p-6 shadow-card ${
                                    entryToEdit?.id === entry.id ? 'ring-2 ring-accent' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* As in the mockup: the countries and continent in small letters next to the name */}
                                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                        <h2 className="text-xl font-bold tracking-tight">
                                            {getDestinationName(entry.destination, entry.countryCodes, language)}
                                        </h2>
                                        {describeWishCountries(entry, language) && (
                                            <span className="text-sm text-muted">
                                                {describeWishCountries(entry, language)}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[entry.priority]}`}
                                    >
                                        {t.wishlist.priority(t.priorities[entry.priority])}
                                    </span>
                                </div>
                                <p className="whitespace-pre-line text-ink-soft">{entry.reason}</p>
                                {/* As in the mockup: the best travel time on the left, the buttons on the right */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                    <p className="text-sm text-muted">
                                        {entry.bestTravelTime && t.wishlist.bestTravelTime(entry.bestTravelTime)}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => planTrip(entry)}
                                            className="min-h-10 cursor-pointer rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-dark"
                                        >
                                            {t.wishlist.planTrip}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEntryToEdit(entry)}
                                            className="min-h-10 cursor-pointer rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-accent hover:bg-accent-soft"
                                        >
                                            {t.common.edit}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEntryToDelete(entry)}
                                            className="min-h-10 cursor-pointer rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-danger hover:bg-danger-soft"
                                        >
                                            {t.common.delete}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* The key makes React build a fresh form when another entry is chosen */}
                {entryToEdit ? (
                    <WishlistForm
                        key={entryToEdit.id}
                        entry={entryToEdit}
                        onSave={(request) => handleUpdate(entryToEdit.id, request)}
                        onCancel={() => setEntryToEdit(null)}
                    />
                ) : (
                    <WishlistForm key="new" onSave={handleAdd}/>
                )}
            </div>

            {entryToDelete && (
                <ConfirmDialog
                    title={t.wishlist.deleteTitle}
                    message={t.wishlist.deleteMessage(getDestinationName(entryToDelete.destination, entryToDelete.countryCodes, language))}
                    confirmLabel={t.common.delete}
                    onConfirm={() => void handleDelete(entryToDelete)}
                    onCancel={() => setEntryToDelete(null)}
                />
            )}
        </section>
    )
}
