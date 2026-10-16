import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import {
  NOTES,
  TOPIC_TITLE,
  TRACK_TITLE,
  allItems,
  allTags,
  itemsByKind,
  notesToc,
} from '../lib/content'
import { loadProgress } from '../lib/storage'
import type { ItemKind } from '../lib/types'

const buckets = [1, 2, 3, 5, 10] as const
type Mode = 'notes' | 'theory' | 'practice'

function asMode(value: string | null): Mode {
  if (value === 'theory' || value === 'practice' || value === 'notes') return value
  return 'notes'
}

export function Learn() {
  const [params, setParams] = useSearchParams()
  const mode = asMode(params.get('view'))
  const items = allItems()
  const progress = loadProgress()
  const started = items.filter((item) => (progress[item.id]?.count ?? 0) > 0).length

  function setMode(next: Mode) {
    const copy = new URLSearchParams(params)
    if (next === 'notes') copy.delete('view')
    else copy.set('view', next)
    setParams(copy, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6 sm:p-8">
        <p className="text-sm text-[var(--muted)]">{TRACK_TITLE}</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          {TOPIC_TITLE}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Полный конспект исходного файла и карточки для закрепления: теория и
          практика.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Повторяли {started} из {items.length}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ['notes', 'Конспект'],
              ['theory', 'Теория'],
              ['practice', 'Практика'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${mode === id ? 'bg-[var(--fg)] text-[var(--bg)]' : 'border border-[var(--line)]'}`}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      {mode === 'notes' ? <NotesPanel /> : <CardsPanel kind={mode} />}
    </div>
  )
}

function NotesPanel() {
  const toc = notesToc().filter((entry) => entry.level <= 2)

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">
          Содержание
        </p>
        <nav className="flex max-h-[70vh] flex-col gap-1 overflow-auto text-sm">
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
      <article className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6 sm:p-10">
        <MarkdownBody source={NOTES} />
      </article>
    </div>
  )
}

function CardsPanel({ kind }: { kind: ItemKind }) {
  const [view, setView] = useState<'list' | 'cards'>('cards')
  const [tag, setTag] = useState('all')
  const [bucket, setBucket] = useState<number | 'any'>('any')
  const [unsolved, setUnsolved] = useState(false)
  const [sort, setSort] = useState<'title' | 'progress' | 'recent'>('title')
  const progress = loadProgress()
  const tags = allTags(kind)

  const items = useMemo(() => {
    let next = itemsByKind(kind)
    if (tag !== 'all') next = next.filter((item) => item.tags.includes(tag))
    next = next.filter((item) => {
      const count = progress[item.id]?.count ?? 0
      if (unsolved) return count === 0
      if (bucket === 'any') return true
      return count >= bucket
    })
    next = [...next].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title, 'ru')
      if (sort === 'progress') {
        return (progress[b.id]?.count ?? 0) - (progress[a.id]?.count ?? 0)
      }
      return (progress[b.id]?.lastAt ?? '').localeCompare(
        progress[a.id]?.lastAt ?? '',
      )
    })
    return next
  }, [kind, tag, bucket, unsolved, sort, progress])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="select-control"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="all">Все темы</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="select-control"
          value={bucket === 'any' ? 'any' : String(bucket)}
          onChange={(e) => {
            const value = e.target.value
            setBucket(value === 'any' ? 'any' : Number(value))
            setUnsolved(false)
          }}
        >
          <option value="any">Любой прогресс</option>
          {buckets.map((n) => (
            <option key={n} value={n}>
              ≥{n}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-sm ${unsolved ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
          onClick={() => setUnsolved(!unsolved)}
        >
          Не решали
        </button>
        <select
          className="select-control"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="title">Сортировка: название</option>
          <option value="progress">Сортировка: повторения</option>
          <option value="recent">Сортировка: недавно</option>
        </select>
        <div className="ml-auto flex overflow-hidden rounded-xl border border-[var(--line)]">
          <button
            type="button"
            className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-[var(--bg-elev)]' : ''}`}
            onClick={() => setView('list')}
          >
            Список
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm ${view === 'cards' ? 'bg-[var(--bg-elev)]' : ''}`}
            onClick={() => setView('cards')}
          >
            Карточки
          </button>
        </div>
      </div>
      {view === 'list' ? (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)]">
          {items.map((item) => {
            const count = progress[item.id]?.count ?? 0
            return (
              <li key={item.id}>
                <Link
                  to={`/item/${item.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span>
                    <span className="block">{item.title}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {item.tags.join(', ')}
                    </span>
                  </span>
                  <span className="text-sm text-[var(--muted)]">×{count}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const count = progress[item.id]?.count ?? 0
            return (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5"
              >
                <h2 className="font-serif text-xl">{item.title}</h2>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {item.tags.join(' · ')}
                </p>
                <p className="mt-4 text-sm">Повторений: {count}</p>
              </Link>
            )
          })}
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-[var(--muted)]">Нет карточек по выбранным фильтрам.</p>
      ) : null}
    </div>
  )
}
