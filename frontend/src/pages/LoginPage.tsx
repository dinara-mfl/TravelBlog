import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Anmelden</h1>
      <p className="text-muted">
        Noch kein Konto?{' '}
        <Link to="/register" className="font-semibold text-accent hover:text-accent-dark">
          Registrieren
        </Link>
      </p>
    </main>
  )
}
