import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {getTrips} from '../api/trips'
import {getWishlistEntries} from '../api/wishlistApi'
import TripStats, {type TripStat} from '../components/TripStats'
import WorldMap from '../components/WorldMap'
import ListRowsSkeleton from '../components/skeletons/ListRowsSkeleton'
import LoadingText from '../components/skeletons/LoadingText'
import Skeleton from '../components/skeletons/Skeleton'
import StatTilesSkeleton from '../components/skeletons/StatTilesSkeleton'
import type {Texts} from '../i18n/texts'
import {useLanguage} from '../i18n/useLanguage'
import type {CountryCollection} from '../types/country'
import type {Trip} from '../types/trip'
import type {WishlistEntry} from '../types/WishlistEntry'
import {getContinents, getCountryName, getDestinationName} from '../utils/countries'
import {loadCountryBorders} from '../utils/countryBorders'
import {formatDateRange} from '../utils/dates'
import {collectVisitedCountries, getTripsToCountry, getWorldShare} from '../utils/visitedCountries'

// All countries of all wishlist entries, each only once, e.g. ["IS", "AR", "CL"]
function collectWishlistCodes(entries: WishlistEntry[]): string[] {
    const codes: string[] = []
    for (const entry of entries) {
        for (const code of entry.countryCodes) {
            if (!codes.includes(code)) {
                codes.push(code)
            }
        }
    }
    return codes
}

// The wishlist entries that have a country, e.g. all entries with "IS"
function getWishlistEntriesForCountry(entries: WishlistEntry[], code: string): WishlistEntry[] {
    return entries.filter((entry) => entry.countryCodes.includes(code))
}

// Short text next to a wishlist destination, e.g. "Priorität: hoch · Februar"
function describeWish(entry: WishlistEntry, t: Texts): string {
    const priority = t.wishlist.priority(t.priorities[entry.priority])
    return entry.bestTravelTime ? `${priority} · ${entry.bestTravelTime}` : priority
}

export default function WorldMapPage() {
    const {t, language} = useLanguage()
    const [countries, setCountries] = useState<CountryCollection | null>(null)
    // The errors are remembered as true/false and their texts are made when they are shown,
    // so they follow a change of the language
    const [mapFailed, setMapFailed] = useState(false)
    const [trips, setTrips] = useState<Trip[]>([])
    const [tripsFailed, setTripsFailed] = useState(false)
    const [wishlistEntries, setWishlistEntries] = useState<WishlistEntry[]>([])
    const [wishlistFailed, setWishlistFailed] = useState(false)
    // The number tiles need the trips and the wishlist; until both are loaded they show placeholders, not "0"
    const [tripsLoading, setTripsLoading] = useState(true)
    const [wishlistLoading, setWishlistLoading] = useState(true)
    // The visited country whose trips are shown below the map; null while none is chosen
    const [selectedCode, setSelectedCode] = useState<string | null>(null)

    // Load the country borders, the trips and the wishlist once when the page opens.
    // They are loaded separately: if the trips or the wishlist fail, the map is still shown.
    useEffect(() => {
        loadCountryBorders()
            .then((loadedCountries) => setCountries(loadedCountries))
            .catch(() => setMapFailed(true))

        getTrips()
            .then((loadedTrips) => setTrips(loadedTrips))
            .catch(() => setTripsFailed(true))
            .finally(() => setTripsLoading(false))

        getWishlistEntries()
            .then((loadedEntries) => setWishlistEntries(loadedEntries))
            .catch(() => setWishlistFailed(true))
            .finally(() => setWishlistLoading(false))
    }, [])

    const visitedCountries = collectVisitedCountries(trips, language)
    const visitedCodes = visitedCountries.map((country) => country.code)
    const wishlistCodes = collectWishlistCodes(wishlistEntries)
    const selectedTrips = selectedCode ? getTripsToCountry(trips, selectedCode) : []
    const selectedWishlistEntries = selectedCode ? getWishlistEntriesForCountry(wishlistEntries, selectedCode) : []

    // A click on a country (on the map or in the list) shows its trips and wishes; a second click hides them again.
    // The function form of setSelectedCode always gets the current value, also inside the Leaflet click handler.
    function toggleCountry(code: string) {
        setSelectedCode((currentCode) => (currentCode === code ? null : code))
    }

    // Countries that are too small for the world map (e.g. Malta) count as visited,
    // but they have no continent in our list and so do not count for "Kontinente".
    const continentCount = getContinents(visitedCodes, language).length

    // Tiles as in the mockup
    const stats: TripStat[] = [
        {label: t.worldMap.countriesVisited, value: String(visitedCodes.length)},
        {label: t.worldMap.continents, value: String(continentCount)},
        {label: t.worldMap.worldShare, value: getWorldShare(visitedCodes.length, language)},
        {label: t.worldMap.wishes, value: String(wishlistEntries.length)},
        {label: t.worldMap.wishCountries, value: String(wishlistCodes.length)},
    ]

    const loading = tripsLoading || wishlistLoading

    // The hint under the map is only needed while a color is still missing (not while the data is loading)
    const hints: string[] = []
    if (!loading && visitedCodes.length === 0) {
        hints.push(t.worldMap.hintVisited)
    }
    if (!loading && wishlistCodes.length === 0) {
        hints.push(t.worldMap.hintWishes)
    }

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-4xl font-bold tracking-tight">{t.worldMap.title}</h1>
                <p className="text-muted">{t.worldMap.subtitle}</p>
            </div>

            {loading ? <StatTilesSkeleton count={stats.length}/> : <TripStats stats={stats}/>}

            {mapFailed && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                    {t.worldMap.mapError}
                </p>
            )}

            {!mapFailed && (
                <div className="flex flex-col gap-5 rounded-card bg-surface p-4 shadow-card md:p-6">
                    {countries ? (
                        <WorldMap
                            countries={countries}
                            visitedCodes={visitedCodes}
                            wishlistCodes={wishlistCodes}
                            selectedCode={selectedCode}
                            onCountryClick={toggleCountry}
                        />
                    ) : (
                        <>
                            <LoadingText text={t.worldMap.loading}/>
                            <Skeleton className="h-56 w-full rounded-xl md:h-[28rem]"/>
                        </>
                    )}

                    {/* Legend as in the mockup; the colored dots are only decoration for screen readers */}
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true" className="size-3 rounded-full bg-accent"/>
                            <span>{t.worldMap.legendVisited}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true" className="size-3 rounded-full bg-wish"/>
                            <span>{t.worldMap.legendWish}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true" className="size-3 rounded-full bg-land"/>
                            <span>{t.worldMap.legendOpen}</span>
                        </li>
                    </ul>

                    {hints.length > 0 && <p className="text-sm text-muted">{hints.join(' ')}</p>}
                </div>
            )}

            {/* The trips and wishlist destinations of the chosen country, directly below the map
                so that the user sees them after the click. Each part is only shown when it has entries. */}
            {selectedCode && (
                <div className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-bold tracking-tight">{getCountryName(selectedCode, language)}</h2>
                        <button
                            type="button"
                            onClick={() => setSelectedCode(null)}
                            className="min-h-10 cursor-pointer rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-accent hover:bg-accent-soft"
                        >
                            {t.common.close}
                        </button>
                    </div>

                    {selectedTrips.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-semibold text-muted">{t.worldMap.yourTrips}</h3>
                            <ul className="flex flex-col">
                                {selectedTrips.map((trip) => (
                                    <li key={trip.id} className="border-t border-line">
                                        <Link
                                            to={`/trips/${trip.id}`}
                                            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-[15px] hover:text-accent"
                                        >
                                            <span className="font-semibold">{trip.title}</span>
                                            <span className="text-sm text-muted">
                                                {formatDateRange(trip.startDate, trip.endDate, language)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {selectedWishlistEntries.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-semibold text-muted">{t.worldMap.yourWishes}</h3>
                            <ul className="flex flex-col">
                                {selectedWishlistEntries.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line py-3 text-[15px]"
                                    >
                                        <span className="font-semibold">
                                            {getDestinationName(entry.destination, entry.countryCodes, language)}
                                        </span>
                                        <span className="text-sm text-muted">{describeWish(entry, t)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/wishlist"
                                className="text-sm font-semibold text-accent underline hover:text-accent-dark"
                            >
                                {t.worldMap.toWishlist}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* As in the mockup: visited countries on the left, wishlist destinations on the right */}
            <div className="grid items-start gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card">
                    <h2 className="text-lg font-bold tracking-tight">{t.worldMap.visitedCountries}</h2>

                    {tripsFailed && (
                        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                            {t.worldMap.tripsError}
                        </p>
                    )}

                    {tripsLoading && <ListRowsSkeleton/>}

                    {!tripsLoading && !tripsFailed && visitedCountries.length === 0 && (
                        <p className="text-sm text-muted">{t.worldMap.noVisitedCountries}</p>
                    )}

                    {visitedCountries.length > 0 && (
                        <ul className="flex flex-col">
                            {/* Buttons, so that the trips of a country can also be opened with the keyboard;
                                the countries on the map cannot be reached with the keyboard */}
                            {visitedCountries.map((country) => (
                                <li key={country.code} className="border-t border-line">
                                    <button
                                        type="button"
                                        onClick={() => toggleCountry(country.code)}
                                        aria-pressed={country.code === selectedCode}
                                        className={`flex w-full cursor-pointer items-baseline justify-between gap-4 py-3 text-left text-[15px] hover:text-accent ${
                                            country.code === selectedCode ? 'text-accent' : ''
                                        }`}
                                    >
                                        <span className="font-semibold">{country.name}</span>
                                        <span className="text-right text-sm text-muted">
                                            {`${country.lastYear} · ${t.common.trips(country.tripCount)}`}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to="/trips" className="text-sm font-semibold text-accent underline hover:text-accent-dark">
                        {t.worldMap.toTrips}
                    </Link>
                </div>

                <div className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card">
                    <h2 className="text-lg font-bold tracking-tight">{t.worldMap.wishes}</h2>

                    {wishlistFailed && (
                        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                            {t.worldMap.wishesError}
                        </p>
                    )}

                    {wishlistLoading && <ListRowsSkeleton/>}

                    {!wishlistLoading && !wishlistFailed && wishlistEntries.length === 0 && (
                        <p className="text-sm text-muted">{t.worldMap.noWishes}</p>
                    )}

                    {wishlistEntries.length > 0 && (
                        <ul className="flex flex-col">
                            {wishlistEntries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex items-baseline justify-between gap-4 border-t border-line py-3 text-[15px]"
                                >
                                    <span className="font-semibold">
                                        {getDestinationName(entry.destination, entry.countryCodes, language)}
                                    </span>
                                    <span className="text-right text-sm text-muted">
                                        {getContinents(entry.countryCodes, language).join(', ')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to="/wishlist" className="text-sm font-semibold text-accent underline hover:text-accent-dark">
                        {t.worldMap.toWishlist}
                    </Link>
                </div>
            </div>
        </section>
    )
}
