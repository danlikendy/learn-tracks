import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { displayHeading, getItem } from '../lib/content'
import { adjustCount, loadFavorites, loadProgress, toggleFavorite } from '../lib/storage'

export function ItemPage() {
  const { id } = useParams()
  const found = id ? getItem(id) : undefined
  const [count, setCount] = useState(
    () => (id ? loadProgress()[id]?.count ?? 0 : 0),
  )
  const [favorite, setFavorite] = useState(
    () => (id ? loadFavorites().includes(id) : false),
  )

  useEffect(() => {
    setCount(id ? loadProgress()[id]?.count ?? 0 : 0)
    setFavorite(id ? loadFavorites().includes(id) : false)
  }, [id])

  function change(delta: number) {
    if (!id) return
    const map = adjustCount(id, delta)
    setCount(map[id]?.count ?? 0)
  }

  const neighbors = useMemo(() => {
    if (!found) return { prev: undefined, next: undefined }
    const list = found.topic.items.filter((entry) => entry.kind === found.item.kind)
    const index = list.findIndex((entry) => entry.id === found.item.id)
    return { prev: list[index - 1], next: list[index + 1] }
  }, [found])

  if (!found) {
    return <p>Карточка не найдена.</p>
  }

  const { item, topic } = found
  const back = `/cards?topic=${topic.id}${item.kind === 'practice' ? '&kind=practice' : ''}`

  return (
    <article className="mx-auto flex w-full max-w-[46rem] flex-col gap-6">
      <Link to={back} className="w-fit text-sm text-[var(--muted)]">
        Назад к {item.kind === 'theory' ? 'теории' : 'практике'}
      </Link>
      <header>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {item.kind === 'theory' ? 'теория' : 'практика'} · {topic.title}
        </p>
        <h1 className="mt-2 font-serif text-3xl">{displayHeading(item.title)}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Повторений: {count}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-full border border-[var(--line)] px-5 py-2"
            onClick={() => change(-1)}
            disabled={count === 0}
          >
            −
          </button>
          <button
            type="button"
            className="rounded-full bg-[var(--fg)] px-5 py-2 text-[var(--bg)]"
            onClick={() => change(1)}
          >
            +
          </button>
          <button
            type="button"
            aria-pressed={favorite}
            className={`rounded-full border px-5 py-2 ${favorite ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
            onClick={() => {
              if (!id) return
              setFavorite(toggleFavorite(id).includes(id))
            }}
          >
            {favorite ? 'В избранном' : 'В избранное'}
          </button>
        </div>
      </header>
      <MarkdownBody source={item.body.replace(/^##\s+[^\n]+\n+/, '')} />
      <div className="flex justify-between gap-4 text-sm">
        {neighbors.prev ? (
          <Link to={`/item/${neighbors.prev.id}`}>← {displayHeading(neighbors.prev.title)}</Link>
        ) : (
          <span />
        )}
        {neighbors.next ? (
          <Link to={`/item/${neighbors.next.id}`}>{displayHeading(neighbors.next.title)} →</Link>
        ) : null}
      </div>
    </article>
  )
}
