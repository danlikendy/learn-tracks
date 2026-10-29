import { useEffect } from 'react'
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

function notesForStudy(topic: Topic): string {
  const prefix = `# ${topic.title}`
  if (!topic.notes.startsWith(prefix)) return topic.notes
  return topic.notes.slice(prefix.length).replace(/^\n+/, '')
}

const TOC_GROUPS: Record<string, { title: string; headings: string[] }[]> = {
  'numerical-methods': [
    {
      title: 'Прямой метод',
      headings: ['Время обучения линейной регрессии'],
    },
    {
      title: 'Итерации, ошибка и остановка',
      headings: ['Итеративные методы', 'Метод бисекции', 'Сравнение методов'],
    },
    {
      title: 'Градиент',
      headings: [
        'Минимизация функции потерь',
        'Градиент функции',
        'Градиентный спуск',
        'Градиентный спуск для линейной регрессии',
        'Стохастический градиентный спуск',
      ],
    },
    {
      title: 'Где спуск используется',
      headings: [
        'Основы нейронных сетей',
        'Обучение нейронных сетей',
        'Ансамбли и бустинг',
        'Градиентный бустинг',
        'Регуляризация градиентного бустинга',
        'Библиотеки для градиентного бустинга',
        'Проработка запроса',
      ],
    },
  ],
}

function NotesPanel({ topic }: { topic: Topic }) {
  const source = notesForStudy(topic)
  const toc = notesToc(source).filter((entry) => entry.level === 2)

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [topic.id, source])
  const groups = TOC_GROUPS[topic.id]
  const used = new Set<string>()
  const grouped = groups?.map((group) => ({
    title: group.title,
    entries: group.headings.flatMap((heading) => {
      const entry = toc.find((item) => item.title === heading)
      if (!entry) return []
      used.add(entry.id)
      return [entry]
    }),
  }))
  const rest = toc.filter((entry) => !used.has(entry.id))

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">
          Содержание
        </p>
        <nav className="toc-nav flex max-h-[70vh] flex-col gap-1 overflow-auto text-sm">
          {grouped
            ? grouped.map((group) => (
                <div key={group.title} className="mb-3 flex flex-col gap-1">
                  <p className="text-xs text-[var(--fg)]">{group.title}</p>
                  {group.entries.map((entry) => (
                    <a key={entry.id} href={`#${entry.id}`} className="pl-3 text-[var(--muted)]">
                      {entry.title}
                    </a>
                  ))}
                </div>
              ))
            : null}
          {(grouped ? rest : toc).map((entry) => (
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
        <MarkdownBody source={source} />
      </article>
    </div>
  )
}
