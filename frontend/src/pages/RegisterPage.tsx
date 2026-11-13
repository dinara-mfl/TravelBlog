import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Registrieren</h1>
      <p className="text-muted">
        Bereits registriert?{' '}
        <Link to="/login" className="font-semibold text-accent hover:text-accent-dark">
          Anmelden
        </Link>
      </p>
    </main>
  )
}
