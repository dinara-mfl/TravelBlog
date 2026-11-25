import {useState, type SubmitEvent} from 'react'
import {getErrorMessage, getFieldErrors} from '../api/client'
import FormField from './FormField'
import {useLanguage} from '../i18n/useLanguage'
import {PRIORITIES, type Priority, type WishlistEntry, type WishlistEntryRequest} from '../types/WishlistEntry'
import {getCountryName, getCountryNames, getSortedCountries, isNamedAfterCountries} from '../utils/countries'

// Same limit as in the backend (WishlistEntryRequest)
const MAX_COUNTRIES = 10

type WishlistFormProps = {
    // The entry to edit; without it the form creates a new entry
    entry?: WishlistEntry
    // Saves the data; the page decides whether that is "create" or "update"
    onSave: (request: WishlistEntryRequest) => Promise<void>
    // Leaves the edit mode; not needed while creating
    onCancel?: () => void
}

// Field errors as the backend sends them: field name → message
type FieldErrors = Record<string, string>

// The text for the field "Ort oder Region" when an entry is edited.
// If the entry is only named after its countries (e.g. "Island"), the field stays empty:
// that name was made automatically, and it should follow when the user changes the countries.
function getOwnDestination(entry: WishlistEntry | undefined): string {
    if (!entry) {
        return ''
    }
    if (isNamedAfterCountries(entry.destination, entry.countryCodes)) {
        return ''
    }
    return entry.destination
}

// Form for creating and editing a wishlist entry.
// The countries come first; the place or region is optional, without it the entry is named after its countries.
export default function WishlistForm({entry, onSave, onCancel}: Readonly<WishlistFormProps>) {
    const {t, language} = useLanguage()
    const [destination, setDestination] = useState(getOwnDestination(entry))
    const [reason, setReason] = useState(entry?.reason ?? '')
    const [priority, setPriority] = useState<Priority>(entry?.priority ?? 'MEDIUM')
    const [bestTravelTime, setBestTravelTime] = useState(entry?.bestTravelTime ?? '')
    const [countryCodes, setCountryCodes] = useState<string[]>(entry?.countryCodes ?? [])
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [submitting, setSubmitting] = useState(false)

    // Adds the country chosen in the select box; the box then shows "Land hinzufügen …" again
    function addCountry(code: string) {
        if (code && !countryCodes.includes(code)) {
            setCountryCodes([...countryCodes, code])
        }
    }

    function removeCountry(code: string) {
        setCountryCodes(countryCodes.filter((existingCode) => existingCode !== code))
    }

    // The select box offers only the countries that are not chosen yet
    const selectableCountries = getSortedCountries(language).filter((country) => !countryCodes.includes(country.code))
    const countryLimitReached = countryCodes.length >= MAX_COUNTRIES

    // The backend names country errors "countryCodes" (whole list) or "countryCodes[1]" (one code)
    const countryError = Object.entries(fieldErrors)
        .find(([field]) => field.startsWith('countryCodes'))?.[1]

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setFieldErrors({})

        // The select box cannot be marked "required" like a text field, so this is checked here.
        // The backend checks it as well.
        if (countryCodes.length === 0) {
            setFieldErrors({countryCodes: t.wishlist.countryRequired})
            return
        }

        // Without a place or region, the entry is named after its countries, e.g. "Argentinien, Chile";
        // the wishlist shows such a name in the language of the user interface (getDestinationName).
        // The backend always gets a destination, so it does not need to know about this rule.
        const ownDestination = destination.trim()
        const destinationToSave = ownDestination === '' ? getCountryNames(countryCodes, language) : ownDestination

        setSubmitting(true)
        try {
            await onSave({destination: destinationToSave, reason, priority, bestTravelTime, countryCodes})
            // After creating an entry the form stays open, so empty it for the next one
            if (!entry) {
                setDestination('')
                setReason('')
                setPriority('MEDIUM')
                setBestTravelTime('')
                setCountryCodes([])
            }
        } catch (err) {
            // A validation error (400) carries an "errors" object with one message per field
            const errorsOfFields = getFieldErrors(err)
            const hasFieldErrors = Object.keys(errorsOfFields).length > 0
            if (hasFieldErrors) {
                setFieldErrors(errorsOfFields)
            } else {
                setError(getErrorMessage(err, t.wishlist.saveFailed))
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5 rounded-card bg-surface p-6 shadow-card">
            <h2 className="text-xl font-bold tracking-tight">
                {entry ? t.wishlist.editTitle : t.wishlist.newTitle}
            </h2>

            {/* Countries (at least one): chosen one by one from a list, shown below as small badges with a remove button */}
            <div className="flex flex-col gap-2">
                <label htmlFor="country" className="text-sm font-semibold text-ink-soft">
                    {t.wishlist.countries}
                </label>
                <select
                    id="country"
                    value=""
                    onChange={(e) => addCountry(e.target.value)}
                    disabled={countryLimitReached}
                    className="min-h-12 rounded-xl border border-line-strong bg-surface px-4 text-[15px] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft disabled:opacity-60"
                >
                    <option value="">
                        {countryLimitReached ? t.wishlist.countryLimit(MAX_COUNTRIES) : t.wishlist.addCountry}
                    </option>
                    {selectableCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                        </option>
                    ))}
                </select>

                {countryCodes.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                        {countryCodes.map((code) => (
                            <li
                                key={code}
                                className="flex items-center gap-1 rounded-full bg-accent-soft py-1 pr-1 pl-3 text-sm font-semibold text-accent-dark"
                            >
                                <span>{getCountryName(code, language)}</span>
                                <button
                                    type="button"
                                    onClick={() => removeCountry(code)}
                                    aria-label={t.photos.remove(getCountryName(code, language))}
                                    className="flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-surface"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {countryError && (
                    <p role="alert" className="text-sm text-danger">{countryError}</p>
                )}
            </div>

            {/* Optional: a place or region inside the countries, e.g. "Patagonien" or "Machu Picchu" */}
            <FormField
                id="destination"
                label={<><span>{t.wishlist.destination}</span>{' '}<span className="font-normal text-muted">{t.common.optional}</span></>}
                placeholder={t.wishlist.destinationPlaceholder}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                error={fieldErrors.destination}
            />

            <div className="flex flex-col gap-2">
                <label htmlFor="reason" className="text-sm font-semibold text-ink-soft">
                    {t.wishlist.reason}
                </label>
                <textarea
                    id="reason"
                    rows={4}
                    placeholder={t.wishlist.reasonPlaceholder}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="rounded-xl border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent-soft"
                />
            </div>
            {fieldErrors.reason && (
                <p role="alert" className="-mt-3 text-sm text-danger">{fieldErrors.reason}</p>
            )}

            <div className="flex flex-col gap-2">
                <label htmlFor="priority" className="text-sm font-semibold text-ink-soft">
                    {t.wishlist.priorityLabel}
                </label>
                <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="min-h-12 rounded-xl border border-line-strong bg-surface px-4 text-[15px] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
                >
                    {PRIORITIES.map((option) => (
                        <option key={option} value={option}>{t.priorities[option]}</option>
                    ))}
                </select>
            </div>

            <FormField
                id="bestTravelTime"
                // Same look as "Beschreibung (optional)" in the trip dialog
                label={<><span>{t.wishlist.bestTravelTimeLabel}</span>{' '}<span className="font-normal text-muted">{t.common.optional}</span></>}
                placeholder={t.wishlist.bestTravelTimePlaceholder}
                value={bestTravelTime}
                onChange={(e) => setBestTravelTime(e.target.value)}
                maxLength={100}
                error={fieldErrors.bestTravelTime}
            />

            {error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="min-h-12 cursor-pointer rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark disabled:cursor-default disabled:opacity-60"
            >
                {submitting && t.common.saving}
                {!submitting && (entry ? t.wishlist.saveChanges : t.wishlist.add)}
            </button>

            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="min-h-12 cursor-pointer rounded-full border border-line-strong bg-surface px-6 text-[15px] font-semibold text-ink-soft hover:bg-page"
                >
                    {t.common.cancel}
                </button>
            )}
        </form>
    )
}
