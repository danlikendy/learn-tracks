import { Link } from 'react-router-dom'
import { allItems, TOPIC_TITLE, TRACK_TITLE } from '../lib/content'
import { loadProgress } from '../lib/storage'

export function Home() {
  const items = allItems()
  const progress = loadProgress()
  const started = items.filter((item) => (progress[item.id]?.count ?? 0) > 0).length
  const theory = items.filter((item) => item.kind === 'theory').length
  const practice = items.filter((item) => item.kind === 'practice').length

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-8">
        <p className="text-sm text-[var(--muted)]">{TRACK_TITLE}</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">{TOPIC_TITLE}</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Открытый конспект для закрепления уже изученного. Формулировки как в
          исходных заметках, формулы набраны математически, код в одном стиле.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-[var(--fg)] px-5 py-2 text-[var(--bg)]"
            to="/learn/theory"
          >
            Теория
          </Link>
          <Link
            className="rounded-full border border-[var(--line)] px-5 py-2"
            to="/learn/practice"
          >
            Практика
          </Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Теория" value={String(theory)} />
        <Stat label="Практика" value={String(practice)} />
        <Stat label="Уже повторяли" value={`${started} / ${items.length}`} />
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  )
}
