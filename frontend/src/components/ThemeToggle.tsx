import {useState} from 'react'
import {useLanguage} from '../i18n/useLanguage'
import {getTheme, saveTheme, type Theme} from '../theme'

// Sun / moon button next to the language switch: switches between the light and the dark design.
// The button shows the design it switches to (a moon in the light design).
export default function ThemeToggle() {
    const {t} = useLanguage()
    const [theme, setTheme] = useState<Theme>(getTheme)
    const next: Theme = theme === 'dark' ? 'light' : 'dark'

    function toggle() {
        saveTheme(next)
        setTheme(next)
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={next === 'dark' ? t.theme.toDark : t.theme.toLight}
            title={next === 'dark' ? t.theme.toDark : t.theme.toLight}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-muted hover:text-ink"
        >
            {next === 'dark' ? <MoonIcon/> : <SunIcon/>}
        </button>
    )
}

function MoonIcon() {
    return (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
        </svg>
    )
}

function SunIcon() {
    return (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
    )
}
