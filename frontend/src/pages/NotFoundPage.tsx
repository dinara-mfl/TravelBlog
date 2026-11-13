import { Link } from 'react-router-dom'
import { HOME_PATH } from '../navigation'

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Seite nicht gefunden</h1>
      <p className="text-muted">Diese Seite gibt es nicht (mehr).</p>
      <Link to={HOME_PATH} className="font-semibold text-accent hover:text-accent-dark">
        Zurück zu meinen Reisen
      </Link>
    </main>
  )
}
