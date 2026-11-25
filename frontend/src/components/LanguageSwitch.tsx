import {LANGUAGE_NAMES, LANGUAGES} from '../i18n/language'
import {useLanguage} from '../i18n/useLanguage'

// "DE | EN" in the header and on the login and registration pages. The pressed button is the current language.
export default function LanguageSwitch() {
    const {language, setLanguage, t} = useLanguage()

    return (
        <fieldset className="flex items-center rounded-full border border-line-strong bg-surface p-0.5">
            <legend className="sr-only">{t.language.label}</legend>
            {LANGUAGES.map((option) => {
                const active = option === language
                return (
                    <button
                        key={option}
                        type="button"
                        lang={option}
                        aria-pressed={active}
                        title={LANGUAGE_NAMES[option]}
                        onClick={() => setLanguage(option)}
                        className={`min-h-10 min-w-10 cursor-pointer rounded-full px-2.5 text-[13px] font-bold ${
                            active ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
                        }`}
                    >
                        {option.toUpperCase()}
                    </button>
                )
            })}
        </fieldset>
    )
}
