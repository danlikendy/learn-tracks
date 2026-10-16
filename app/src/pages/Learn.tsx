import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { allTags, itemsByKind, TOPIC_TITLE } from '../lib/content'
import { loadProgress } from '../lib/storage'
import type { ItemKind } from '../lib/types'

const buckets = [0, 1, 2, 3, 5, 10] as const

function asKind(value: string | undefined): ItemKind | 'all' {
  if (value === 'theory' || value === 'practice') return value
  return 'all'
}

export function Learn() {
  const { kind: kindParam } = useParams()
  const kind = asKind(kindParam)
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

  const title =
    kind === 'theory' ? 'Теория' : kind === 'practice' ? 'Практика' : 'Все карточки'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--muted)]">{TOPIC_TITLE}</p>
        <h1 className="font-serif text-3xl">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2 text-sm"
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
          className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2 text-sm"
          value={bucket === 'any' ? 'any' : String(bucket)}
          onChange={(e) => {
            const value = e.target.value
            setBucket(value === 'any' ? 'any' : Number(value))
            setUnsolved(false)
          }}
        >
          <option value="any">Любой прогресс</option>
          {buckets.filter(Boolean).map((n) => (
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
          className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="title">Сортировка: название</option>
          <option value="progress">Сортировка: повторения</option>
          <option value="recent">Сортировка: недавно</option>
        </select>
        <div className="ml-auto flex rounded-xl border border-[var(--line)]">
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
        <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)]">
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
                      {item.kind === 'theory' ? 'теория' : 'практика'} ·{' '}
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
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  {item.kind === 'theory' ? 'теория' : 'практика'}
                </p>
                <h2 className="mt-2 font-serif text-xl">{item.title}</h2>
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
