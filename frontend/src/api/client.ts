import axios from 'axios'
import {getLanguage} from '../i18n/language'
import {startWatching, stopWatching} from './slowRequests'

export const TOKEN_KEY = 'token'

const api = axios.create()

// Send the JWT and the language of the user interface with every request.
// The backend answers with messages in that language and asks the place search and Wikipedia in it.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Accept-Language'] = getLanguage()
    startWatching(config) // a notice appears if the answer takes long (the server is waking up)
    return config
})

// Token missing, invalid or expired: go back to the login page
api.interceptors.response.use(
    (response) => {
        stopWatching(response.config)
        return response
    },
    (error) => {
        stopWatching(error.config)
        const isAuthCall = error.config?.url?.startsWith('/api/auth/')
        if (error.response?.status === 401 && !isAuthCall) {
            localStorage.removeItem(TOKEN_KEY)
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

// API errors are ProblemDetail objects; the message is in "detail"
export function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.detail ?? fallback
    }
    return fallback
}

export function getFieldErrors(error: unknown): Record<string, string> {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.errors ?? {}
    }
    return {}
}

export default api