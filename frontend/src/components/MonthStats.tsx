import {LANGUAGES, LOCALES, type Language} from '../i18n/language'
import {useLanguage} from '../i18n/useLanguage'

type MonthName = { short: string, long: string }

// Month names from the browser, e.g. "Jan" and "Januar" in German, "Jan" and "January" in English
function monthNames(language: Language): MonthName[] {
    const shortFormat = new Intl.DateTimeFormat(LOCALES[language], {month: 'short', timeZone: 'UTC'})
    const longFormat = new Intl.DateTimeFormat(LOCALES[language], {month: 'long', timeZone: 'UTC'})
    return Array.from({length: 12}, (_, month) => {
        const date = new Date(Date.UTC(2024, month, 1))
        return {short: shortFormat.format(date).replace('.', ''), long: longFormat.format(date)}
    })
}

// Made once for each language
const MONTHS = Object.fromEntries(LANGUAGES.map((language) => [language, monthNames(language)])) as Record<Language, MonthName[]>

// "Reisetage nach Monaten" on the statistics page: a column per month whose height shows the travel days in that month over
// all years. The busiest months (several if they share the most days) are named below the columns; hovering a column shows its numbers, e.g.
// "April: 23 Tage", and screen readers read them from the list.
export default function MonthStats({daysPerMonth}: Readonly<{ daysPerMonth: number[] }>) {
    const {t, language} = useLanguage()
    const months = MONTHS[language]
    const maxDays = Math.max(1, ...daysPerMonth)
    const mostDays = Math.max(...daysPerMonth)
    const busiestMonths = months.filter((_, index) => daysPerMonth[index] === mostDays).map((month) => month.long)

    return (
        <section aria-labelledby="month-stats-title" className="flex flex-col gap-3 rounded-card bg-surface px-6 py-5 shadow-card">
            <h2 id="month-stats-title" className="text-[13px] font-semibold text-muted">{t.stats.daysByMonth}</h2>
            <ol className="grid h-56 grid-cols-12 items-end gap-1">
                {months.map((month, index) => {
                    const days = daysPerMonth[index]
                    return (
                        <li key={month.long} className="group relative flex h-full flex-col items-center justify-end gap-1.5">
                            <span className="sr-only">{`${month.long}: ${t.common.days(days)}`}</span>
                            {/* Hint above the column; the wide invisible column is the hover target */}
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-surface group-hover:block"
                            >
                                {`${month.long}: ${t.common.days(days)}`}
                            </span>
                            <span
                                aria-hidden="true"
                                className="w-full max-w-6 rounded-t bg-accent group-hover:bg-accent-dark"
                                style={{height: `${(days / maxDays) * 100}%`}}
                            />
                            <span aria-hidden="true" className="text-xs font-semibold text-muted">{month.short}</span>
                        </li>
                    )
                })}
            </ol>
            <p className="text-sm text-ink-soft">
                <span>{t.stats.busiestMonths}</span>{' '}
                <span className="font-semibold text-ink">{`${busiestMonths.join(', ')} (${t.common.days(mostDays)})`}</span>
            </p>
        </section>
    )
}
