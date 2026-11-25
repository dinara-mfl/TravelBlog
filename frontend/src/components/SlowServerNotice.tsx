import {useSyncExternalStore} from 'react'
import {hasSlowRequests, subscribeToSlowRequests} from '../api/slowRequests'
import {useLanguage} from '../i18n/useLanguage'

// A small note at the bottom of the screen while an API request takes long (see api/slowRequests.ts), e.g. when the
// server on Render wakes up after a break. It disappears by itself when the answer arrives.
export default function SlowServerNotice() {
    const {t} = useLanguage()
    // useSyncExternalStore reads the counter in slowRequests.ts and draws the component again when it changes
    const slow = useSyncExternalStore(subscribeToSlowRequests, hasSlowRequests)

    return (
        // Always in the page, so screen readers announce the text when it appears (<output> is a live region)
        <output className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
            {slow && (
                <p className="flex max-w-md items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 text-[15px] text-white shadow-card">
                    <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin"/>
                    <span>{t.common.slowServer}</span>
                </p>
            )}
        </output>
    )
}
