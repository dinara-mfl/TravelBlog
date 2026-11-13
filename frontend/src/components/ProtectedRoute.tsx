import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { TOKEN_KEY } from '../api/client'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    if (!localStorage.getItem(TOKEN_KEY)) {
        return <Navigate to="/login" replace />
    }
    return children
}