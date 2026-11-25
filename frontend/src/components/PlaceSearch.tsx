import {useState, type KeyboardEvent} from 'react'
import {getErrorMessage} from '../api/client'
import {searchPlaces} from '../api/places'
import {useLanguage} from '../i18n/useLanguage'
import type {Place} from '../types/place'

type PlaceSearchProps = {
    selected: Place | null
    onSelect: (place: Place) => void
    error?: string // e.g. "Bitte einen Ort suchen und auswählen."
    initialQuery?: string // text in the search field at the start, e.g. "Island" when a trip is planned from a wish
}

// Search field for a place by name. The search runs on the button or Enter, not on every key,
// because Nominatim allows only one request per second.
export default function PlaceSearch({selected, onSelect, error, initialQuery}: Readonly<PlaceSearchProps>) {
    const {t} = useLanguage()
    const [query, setQuery] = useState(initialQuery ?? '')
    const [results, setResults] = useState<Place[] | null>(null) // null: not searched yet
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState('')

    async function search() {
        if (!query.trim()) return
        setSearching(true)
        setSearchError('')
        try {
            setResults(await searchPlaces(query))
        } catch (err) {
            setResults(null)
            setSearchError(getErrorMessage(err, t.placeSearch.error))
        } finally {
            setSearching(false)
        }
    }

    // Enter starts the search instead of submitting the surrounding form
    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            event.preventDefault()
            void search()
        }
    }

    const message = searchError || error

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="place-search" className="text-sm font-semibold text-ink-soft">
                {t.placeSearch.label}
            </label>
            <div className="flex gap-2">
                <input
                    id="place-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeSearch.placeholder}
                    aria-invalid={message ? true : undefined}
                    aria-describedby={message ? 'place-search-error' : undefined}
                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-4 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent-soft"
                />
                <button
                    type="button"
                    onClick={() => void search()}
                    disabled={searching || !query.trim()}
                    className="min-h-12 cursor-pointer rounded-xl border border-line-strong bg-surface px-4 text-[15px] font-semibold text-ink hover:border-accent disabled:cursor-default disabled:opacity-60"
                >
                    {searching ? t.placeSearch.searching : t.placeSearch.search}
                </button>
            </div>

            {message && (
                <p id="place-search-error" className="text-sm text-danger">
                    {message}
                </p>
            )}

            {results?.length === 0 && (
                <p className="text-sm text-muted">{t.placeSearch.noResults}</p>
            )}

            {results && results.length > 0 && (
                <fieldset className="flex flex-col gap-1.5">
                    <legend className="sr-only">{t.placeSearch.results}</legend>
                    {results.map((place) => {
                        const isSelected = selected?.latitude === place.latitude
                            && selected?.longitude === place.longitude
                        return (
                            <button
                                key={`${place.latitude},${place.longitude}`}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onSelect(place)}
                                className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-left text-[15px] ${
                                    isSelected ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-accent'
                                }`}
                            >
                                <span className="font-semibold text-ink">{place.name}</span>
                                <span className="text-sm text-muted">{place.displayName}</span>
                            </button>
                        )
                    })}
                </fieldset>
            )}
        </div>
    )
}
