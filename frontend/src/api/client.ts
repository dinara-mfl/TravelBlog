import axios from 'axios'

export const TOKEN_KEY = 'token'

const api = axios.create()

// Send the JWT with every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Token missing, invalid or expired: go back to the login page
api.interceptors.response.use(
    (response) => response,
    (error) => {
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

export default api