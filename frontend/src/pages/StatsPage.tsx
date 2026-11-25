import {useEffect, useState} from 'react'
import {getErrorMessage} from '../api/client'
import {getTrips} from '../api/trips'
import CountryStats from '../components/CountryStats'
import ExtremePoints from '../components/ExtremePoints'
import MonthStats from '../components/MonthStats'
import TripRecords from '../components/TripRecords'
import TripStats from '../components/TripStats'
import YearStats from '../components/YearStats'
import StatsSkeleton from '../components/skeletons/StatsSkeleton'
import {useLanguage} from '../i18n/useLanguage'
import type {Trip} from '../types/trip'
import {formatKm, getTotals, getTotalsByYear} from '../utils/tripFilters'
import {getCountryTimes, getDaysPerMonth, getExtremePoints, getRecords} from '../utils/tripStats'

// "Statistik": the totals over all trips, records, the breakdown by year, countries and months,
// and the extreme points.
// On its own page, so that the trip overview starts with the trips.
export default function StatsPage() {
    const {t, language} = useLanguage()
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<unknown>(null)

    // Load the trips once when the page opens
    useEffect(() => {
        let cancelled = false // ignore the answer if the page was left in the meantime
        getTrips()
            .then((data) => {
                if (!cancelled) setTrips(data)
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    // The text is made here and not when the error happens, so it follows a change of the language
    const error = loadError ? getErrorMessage(loadError, t.stats.loadError) : ''
    const totals = getTotals(trips)
    const stats = [
        {label: t.stats.trips, value: String(trips.length)},
        {label: t.stats.travelDays, value: String(totals.days)},
        {label: t.stats.countries, value: String(totals.countries)},
        {label: t.stats.places, value: String(totals.places)},
        {label: t.stats.totalDistance, value: formatKm(totals.km, language)},
    ]
    const yearTotals = getTotalsByYear(trips)
    const countryTimes = getCountryTimes(trips)
    const extremePoints = getExtremePoints(trips)

    return (
        <div className="flex flex-col gap-7">
            <section className="flex flex-col gap-1.5">
                <h1 className="text-4xl font-bold tracking-tight">{t.stats.title}</h1>
                <p className="text-muted">{t.stats.subtitle}</p>
            </section>

            {loading && <StatsSkeleton/>}

            {!loading && error && (
                <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}

            {!loading && !error && trips.length === 0 && (
                <section className="flex flex-col items-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-card">
                    <h2 className="text-xl font-bold">{t.trips.emptyTitle}</h2>
                    <p className="max-w-md text-muted">{t.stats.emptyText}</p>
                </section>
            )}

            {!loading && !error && trips.length > 0 && (
                <>
                    <TripStats stats={stats}/>
                    <TripRecords records={getRecords(trips)}/>
                    <YearStats years={yearTotals}/>
                    {/* Side by side from lg on; trips saved before every trip needed a stop may have no countries */}
                    <div className="grid items-start gap-6 lg:grid-cols-2">
                        {countryTimes.length > 0 && <CountryStats countries={countryTimes}/>}
                        <MonthStats daysPerMonth={getDaysPerMonth(trips)}/>
                    </div>
                    {extremePoints && <ExtremePoints points={extremePoints}/>}
                </>
            )}
        </div>
    )
}
