import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage, TOKEN_KEY } from '../api/client'

type LoginResponse = {
    token: string
    username: string
}

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setError('')
        try {
            const response = await api.post<LoginResponse>('/api/auth/login', { username, password })
            localStorage.setItem(TOKEN_KEY, response.data.token)
            localStorage.setItem('username', response.data.username)
            navigate('/')
        } catch (err) {
            setError(getErrorMessage(err, 'Anmeldung fehlgeschlagen.'))
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Anmelden</h1>
            <input
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
            />
            <input
                placeholder="Passwort"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
            />
            {error && <p>{error}</p>}
            <button type="submit">Anmelden</button>
            <p>
                Noch kein Konto? <Link to="/register">Registrieren</Link>
            </p>
        </form>
    )
}