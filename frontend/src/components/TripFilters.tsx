import {useLanguage} from '../i18n/useLanguage'
import {TRIP_TAGS, type TripTag} from '../types/trip'
import {ALL_YEARS} from '../utils/tripFilters'

type TripFiltersProps = {
    query: string
    onQueryChange: (query: string) => void
    years: string[] // years that have trips, newest first
    selectedYear: string
    onYearChange: (year: string) => void
    selectedTags: TripTag[] // empty: no tag filter
    onTagsChange: (tags: TripTag[]) => void
    resultCount: number // number of trips that match the filters
}

const pillBase = 'min-h-11 cursor-pointer rounded-full border px-4.5 text-sm font-semibold'

// Search field, year buttons and the number of matching trips, as in the mockup
export default function TripFilters({
                                        query,
                                        onQueryChange,
                                        years,
                                        selectedYear,
                                        onYearChange,
                                        selectedTags,
                                        onTagsChange,
                                        resultCount,
                                    }: Readonly<TripFiltersProps>) {
    const {t} = useLanguage()

    // A tag button adds the tag to the filter or removes it again
    function toggleTag(tag: TripTag) {
        onTagsChange(selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag])
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-[1_1_280px] md:max-w-105">
                    <label htmlFor="trip-search" className="sr-only">
                        {t.trips.searchLabel}
                    </label>
                    <SearchIcon/>
                    <input
                        id="trip-search"
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder={t.trips.searchPlaceholder}
                        className="h-11 w-full rounded-full border border-line-strong bg-surface pr-4 pl-11 text-[15px] text-ink outline-none focus:ring-4 focus:ring-accent-soft"
                    />
                </div>

                <fieldset className="flex flex-wrap gap-2">
                    <legend className="sr-only">{t.trips.filterByYear}</legend>
                    {[ALL_YEARS, ...years].map((year) => {
                        const active = year === selectedYear
                        return (
                            <button
                                key={year}
                                type="button"
                                aria-pressed={active}
                                onClick={() => onYearChange(year)}
                                className={
                                    active
                                        ? `${pillBase} border-accent bg-accent text-on-accent`
                                        : `${pillBase} border-line-strong bg-surface text-ink hover:border-accent`
                                }
                            >
                                {year === ALL_YEARS ? t.common.all : year}
                            </button>
                        )
                    })}
                </fieldset>

                <span aria-live="polite" className="ml-auto text-sm text-muted">
                    {t.common.trips(resultCount)}
                </span>
            </div>

            {/* Several tags can be selected; a trip must have all of them. "Alle" clears the tag filter. */}
            <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="float-left mr-1 text-sm font-semibold text-muted">{t.trips.tags}</legend>
                <button
                    type="button"
                    aria-pressed={selectedTags.length === 0}
                    onClick={() => onTagsChange([])}
                    className={
                        selectedTags.length === 0
                            ? `${pillBase} border-accent bg-accent text-on-accent`
                            : `${pillBase} border-line-strong bg-surface text-ink hover:border-accent`
                    }
                >
                    {t.common.all}
                </button>
                {TRIP_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag)
                    return (
                        <button
                            key={tag}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleTag(tag)}
                            className={
                                active
                                    ? `${pillBase} border-accent bg-accent text-on-accent`
                                    : `${pillBase} border-line-strong bg-surface text-ink hover:border-accent`
                            }
                        >
                            {t.tags[tag]}
                        </button>
                    )
                })}
            </fieldset>
        </div>
    )
}

function SearchIcon() {
    return (
        <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
        >
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
        </svg>
    )
}
