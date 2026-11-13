import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setError('')
        try {
            await api.post('/api/auth/register', { username, password })
            navigate('/login')
        } catch (err) {
            setError(getErrorMessage(err, 'Registrierung fehlgeschlagen.'))
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Konto erstellen</h1>
            <input
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
            />
            <input
                placeholder="Passwort (mind. 8 Zeichen)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
            />
            {error && <p>{error}</p>}
            <button type="submit">Registrieren</button>
            <p>
                Schon ein Konto? <Link to="/login">Anmelden</Link>
            </p>
        </form>
    )
}