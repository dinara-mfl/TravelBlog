import {useState, type SubmitEvent} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import api, {getErrorMessage} from '../api/client'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import {useLanguage} from '../i18n/useLanguage'

export default function RegisterPage() {
    const {t} = useLanguage()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        if (username.trim().length < 3 || username.trim().length > 30) {
            setError(t.auth.usernameLength)
            return
        }
        if (password.length < 8) {
            setError(t.auth.passwordLength)
            return
        }

        setSubmitting(true)
        try {
            await api.post('/api/auth/register', {username, password})
            void navigate('/login')
        } catch (err) {
            setError(getErrorMessage(err, t.auth.registerFailed))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthCard
            title={t.auth.registerTitle}
            subtitle={t.auth.registerSubtitle}
            footer={
                <>
                    {t.auth.haveAccount}{' '}
                    <Link to="/login" className="font-semibold text-accent hover:text-accent-dark">
                        {t.auth.login}
                    </Link>
                </>
            }
        >
            <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
                <FormField
                    id="username"
                    label={t.auth.username}
                    placeholder={t.auth.usernameHint}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                />
                <FormField
                    id="password"
                    label={t.auth.password}
                    type="password"
                    placeholder={t.auth.passwordHint}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
                    {submitting ? t.auth.registering : t.auth.register}
                </button>
            </form>
        </AuthCard>
    )
}
