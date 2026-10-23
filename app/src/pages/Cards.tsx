import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Select } from '../components/Select'
import { TOPICS, displayHeading, type Topic } from '../lib/content'
import { loadFavorites, loadProgress, toggleFavorite } from '../lib/storage'
import type { Item, ItemKind } from '../lib/types'

const buckets = [1, 2, 3, 5, 10] as const

type KindFilter = ItemKind

function asKind(value: string | null): KindFilter {
  return value === 'practice' ? 'practice' : 'theory'
}

export function Cards() {
  const [params, setParams] = useSearchParams()
  const kind = asKind(params.get('kind'))
  const topicId = params.get('topic') ?? 'all'
  const [view, setView] = useState<'list' | 'cards'>('cards')
  const [tag, setTag] = useState('all')
  const [bucket, setBucket] = useState<number | 'any'>('any')
  const [unsolved, setUnsolved] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites())
  const [sort, setSort] = useState<'title' | 'progress' | 'recent'>('title')
  const progress = loadProgress()
  const favoriteSet = useMemo(() => new Set(favorites), [favorites])

  function patch(next: Record<string, string | null>) {
    const copy = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (!value) copy.delete(key)
      else copy.set(key, value)
    }
    setParams(copy, { replace: true })
  }

  const pool = useMemo(() => {
    const topics =
      topicId === 'all' ? TOPICS : TOPICS.filter((topic) => topic.id === topicId)
    return topics.flatMap((topic) =>
      topic.items
        .filter((item) => item.kind === kind)
        .map((item) => ({ item, topic })),
    )
  }, [topicId, kind])

  const tags = useMemo(() => {
    const set = new Set<string>()
    for (const row of pool) {
      for (const value of row.item.tags) set.add(value)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [pool])

  const items = useMemo(() => {
    let next = pool
    const needle = query.trim().toLowerCase()
    if (needle) {
      next = next.filter((row) =>
        displayHeading(row.item.title).toLowerCase().includes(needle),
      )
    }
    if (favoritesOnly) {
      next = next.filter((row) => favoriteSet.has(row.item.id))
    }
    if (tag !== 'all') next = next.filter((row) => row.item.tags.includes(tag))
    next = next.filter((row) => {
      const count = progress[row.item.id]?.count ?? 0
      if (unsolved) return count === 0
      if (bucket === 'any') return true
      return count >= bucket
    })
    const programOrder =
      sort === 'title' &&
      next.length > 0 &&
      next.every((row) => /^data-science-ida-t-\d+$/.test(row.item.id))
    next = [...next].sort((a, b) => {
      if (programOrder) return a.item.id.localeCompare(b.item.id)
      if (sort === 'title') {
        return a.item.title.localeCompare(b.item.title, 'ru')
      }
      if (sort === 'progress') {
        return (progress[b.item.id]?.count ?? 0) - (progress[a.item.id]?.count ?? 0)
      }
      return (progress[b.item.id]?.lastAt ?? '').localeCompare(
        progress[a.item.id]?.lastAt ?? '',
      )
    })
    return next
  }, [pool, tag, bucket, unsolved, favoritesOnly, favoriteSet, query, sort, progress])

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          {kind === 'theory' ? 'Теория' : 'Практика'}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {items.length} из {pool.length}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ['theory', 'Теория'],
              ['practice', 'Практика'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${kind === id ? 'bg-[var(--fg)] text-[var(--bg)]' : 'border border-[var(--line)]'}`}
              onClick={() => {
                setTag('all')
                patch({ kind: id === 'theory' ? null : id })
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          className="min-w-56 flex-1 rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
        />
        <Select
          value={topicId}
          onChange={(id) => {
            setTag('all')
            patch({ topic: id === 'all' ? null : id })
          }}
          options={[
            { value: 'all', label: 'Все модули' },
            ...TOPICS.map((topic) => ({ value: topic.id, label: topic.title })),
          ]}
        />
        <Select
          value={tag}
          onChange={setTag}
          options={[
            { value: 'all', label: 'Все темы' },
            ...tags.map((item) => ({ value: item, label: item })),
          ]}
        />
        <Select
          value={bucket === 'any' ? 'any' : String(bucket)}
          onChange={(value) => {
            setBucket(value === 'any' ? 'any' : Number(value))
            setUnsolved(false)
          }}
          options={[
            { value: 'any', label: 'Любой прогресс' },
            ...buckets.map((n) => ({ value: String(n), label: `≥${n}` })),
          ]}
        />
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-sm ${unsolved ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
          onClick={() => setUnsolved(!unsolved)}
        >
          Не решали
        </button>
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-sm ${favoritesOnly ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          Избранное
        </button>
        <Select
          value={sort}
          onChange={(value) => setSort(value as typeof sort)}
          options={[
            { value: 'title', label: 'Сортировка: название' },
            { value: 'progress', label: 'Сортировка: повторения' },
            { value: 'recent', label: 'Сортировка: недавно' },
          ]}
        />
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
        <CardList
          rows={items}
          progress={progress}
          favoriteSet={favoriteSet}
          onToggle={(id) => setFavorites(toggleFavorite(id))}
        />
      ) : (
        <CardGrid
          rows={items}
          progress={progress}
          favoriteSet={favoriteSet}
          onToggle={(id) => setFavorites(toggleFavorite(id))}
        />
      )}
      {items.length === 0 ? (
        <p className="text-[var(--muted)]">Нет карточек по выбранным фильтрам.</p>
      ) : null}
    </div>
  )
}

function CardList({
  rows,
  progress,
  favoriteSet,
  onToggle,
}: {
  rows: { item: Item; topic: Topic }[]
  progress: ReturnType<typeof loadProgress>
  favoriteSet: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)]">
      {rows.map(({ item, topic }) => {
        const count = progress[item.id]?.count ?? 0
        const marked = favoriteSet.has(item.id)
        return (
          <li key={item.id} className="flex items-center gap-2 px-4 py-3">
            <Link to={`/item/${item.id}`} className="min-w-0 flex-1">
              <span className="block">{displayHeading(item.title)}</span>
              <span className="text-xs text-[var(--muted)]">{topic.title}</span>
            </Link>
            <span className="text-sm text-[var(--muted)]">×{count}</span>
            <FavoriteButton marked={marked} onToggle={() => onToggle(item.id)} />
          </li>
        )
      })}
    </ul>
  )
}

function CardGrid({
  rows,
  progress,
  favoriteSet,
  onToggle,
}: {
  rows: { item: Item; topic: Topic }[]
  progress: ReturnType<typeof loadProgress>
  favoriteSet: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(({ item, topic }) => {
        const count = progress[item.id]?.count ?? 0
        const marked = favoriteSet.has(item.id)
        return (
          <article
            key={item.id}
            className="flex min-h-36 flex-col rounded-2xl border border-[var(--line)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-[var(--muted)]">{topic.title}</p>
              <FavoriteButton marked={marked} onToggle={() => onToggle(item.id)} />
            </div>
            <Link to={`/item/${item.id}`} className="mt-2 flex flex-1 flex-col">
              <h2 className="font-serif text-xl">{displayHeading(item.title)}</h2>
              <p className="mt-auto pt-4 text-sm text-[var(--muted)]">Повторений: {count}</p>
            </Link>
          </article>
        )
      })}
    </div>
  )
}

function FavoriteButton({
  marked,
  onToggle,
}: {
  marked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={marked}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs ${marked ? 'border-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)]'}`}
      onClick={onToggle}
    >
      {marked ? 'В избранном' : 'В избранное'}
    </button>
  )
}
