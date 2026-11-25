import type {InternalAxiosRequestConfig} from 'axios'

// Counts the API requests that take longer than SLOW_AFTER_MS. On Render's free plan the server sleeps after a while
// without visitors; the first request afterwards takes about a minute. While a request is that slow, the app shows
// a notice (SlowServerNotice), so the user knows that the app is not broken.
// The first visit itself cannot show it: the server also delivers the page, so the browser waits for the page.

const SLOW_AFTER_MS = 4000

let slowCount = 0
const listeners = new Set<() => void>()
// The timer of each running request; a WeakMap, so finished requests do not stay in memory
const timers = new WeakMap<InternalAxiosRequestConfig, ReturnType<typeof setTimeout>>()
// The requests that already count as slow
const slowRequests = new WeakSet<InternalAxiosRequestConfig>()

function setSlowCount(count: number) {
    slowCount = count
    listeners.forEach((listener) => listener())
}

// Called when a request starts: after SLOW_AFTER_MS it counts as slow
export function startWatching(config: InternalAxiosRequestConfig) {
    timers.set(config, setTimeout(() => {
        slowRequests.add(config)
        setSlowCount(slowCount + 1)
    }, SLOW_AFTER_MS))
}

// Called when a request has an answer or failed
export function stopWatching(config: InternalAxiosRequestConfig | undefined) {
    if (!config) return
    clearTimeout(timers.get(config))
    timers.delete(config)
    if (slowRequests.delete(config)) {
        setSlowCount(slowCount - 1)
    }
}

// For useSyncExternalStore in SlowServerNotice: is at least one request slow right now?
export function subscribeToSlowRequests(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function hasSlowRequests(): boolean {
    return slowCount > 0
}
