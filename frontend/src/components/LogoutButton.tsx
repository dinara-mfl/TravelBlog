import { useNavigate } from 'react-router-dom'
import { TOKEN_KEY } from '../api/client'

export default function LogoutButton() {
    const navigate = useNavigate()

    function logout() {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('username')
        navigate('/login')
    }

    return (
        <button type="button" onClick={logout}>
            Abmelden
        </button>
    )
}