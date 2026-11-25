import {useState, type SubmitEvent} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import api, {getErrorMessage, TOKEN_KEY} from '../api/client'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import {useLanguage} from '../i18n/useLanguage'

type LoginResponse = {
    token: string
    username: string
}

export default function LoginPage() {
    const {t} = useLanguage()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const response = await api.post<LoginResponse>('/api/auth/login', {username, password})
            localStorage.setItem(TOKEN_KEY, response.data.token)
            localStorage.setItem('username', response.data.username)
            void navigate('/')
        } catch (err) {
            setError(getErrorMessage(err, t.auth.loginFailed))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthCard
            title={t.auth.loginTitle}
            subtitle={t.auth.loginSubtitle}
            footer={
                <>
                    {t.auth.noAccount}{' '}
                    <Link to="/register" className="font-semibold text-accent hover:text-accent-dark">
                        {t.auth.registerNow}
                    </Link>
                </>
            }
        >
            <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
                <FormField
                    id="username"
                    label={t.auth.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                />
                <FormField
                    id="password"
                    label={t.auth.password}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />

                {error && (
                    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 min-h-12 cursor-pointer rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent shadow-[0_6px_18px_rgba(31,111,191,0.25)] hover:bg-accent-dark disabled:cursor-default disabled:opacity-60"
                >
                    {submitting ? t.auth.loggingIn : t.auth.login}
                </button>
            </form>
        </AuthCard>
    )
}
