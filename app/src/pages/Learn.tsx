import { useSearchParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { Select } from '../components/Select'
import { TOPICS, getTopic, notesToc, type Topic } from '../lib/content'

export function Learn() {
  const [params, setParams] = useSearchParams()
  const topic = getTopic(params.get('topic'))

  function patch(next: Record<string, string | null>) {
    const copy = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (!value) copy.delete(key)
      else copy.set(key, value)
    }
    setParams(copy, { replace: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="text-sm text-[var(--muted)]">{topic.trackTitle}</p>
        <div className="mt-3">
          <Select
            value={topic.id}
            onChange={(id) => patch({ topic: id })}
            options={TOPICS.map((entry) => ({
              value: entry.id,
              label: entry.title,
            }))}
          />
        </div>
        <h1 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">
          {topic.title}
        </h1>
      </section>
      <NotesPanel topic={topic} />
    </div>
  )
}

function NotesPanel({ topic }: { topic: Topic }) {
  const toc = notesToc(topic.notes).filter((entry) => entry.level <= 2)

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">
          Содержание
        </p>
        <nav className="toc-nav flex max-h-[70vh] flex-col gap-1 overflow-auto text-sm">
          {toc.map((entry) => (
            <a
              key={entry.id + entry.title}
              href={`#${entry.id}`}
              className={entry.level === 1 ? 'text-[var(--fg)]' : 'pl-3 text-[var(--muted)]'}
            >
              {entry.title}
            </a>
          ))}
        </nav>
      </aside>
      <article>
        <MarkdownBody source={topic.notes} />
      </article>
    </div>
  )
}
