import { useParams } from 'react-router-dom'

export default function TripDetailPage() {
  const { id } = useParams()

  return (
    <section className="flex flex-col gap-1.5">
      <h1 className="text-4xl font-bold tracking-tight">Reise-Detail</h1>
      <p className="text-muted">Reise-ID: {id}</p>
    </section>
  )
}
