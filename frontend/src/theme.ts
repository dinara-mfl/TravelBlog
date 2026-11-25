// Light or dark design. index.css has the dark colors under the class "dark" on <html>.
// index.html runs the same choice in a small script before the first paint, so a dark page does not flash white.
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'theme'

// The design the user chose; without a choice the setting of the operating system
export function getTheme(): Theme {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
        return saved
    }
    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function saveTheme(theme: Theme) {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
}
