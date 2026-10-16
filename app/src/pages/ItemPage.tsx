import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { getItem } from '../lib/content'
import { loadProgress, markSolved } from '../lib/storage'

export function ItemPage() {
  const { id } = useParams()
  const found = id ? getItem(id) : undefined
  const [count, setCount] = useState(
    () => (id ? loadProgress()[id]?.count ?? 0 : 0),
  )

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
  const back = `/?topic=${topic.id}&view=${item.kind}`

  return (
    <article className="flex flex-col gap-6">
      <Link to={back} className="w-fit text-sm text-[var(--muted)]">
        Назад к {item.kind === 'theory' ? 'теории' : 'практике'}
      </Link>
      <header>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {item.kind === 'theory' ? 'теория' : 'практика'} · {item.tags.join(' · ')}
        </p>
        <h1 className="mt-2 font-serif text-3xl">{item.title}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Повторений: {count}</p>
        <button
          type="button"
          className="mt-4 rounded-full bg-[var(--fg)] px-5 py-2 text-[var(--bg)]"
          onClick={() => {
            const map = markSolved(item.id)
            setCount(map[item.id].count)
          }}
        >
          Отметить повторение
        </button>
      </header>
      <MarkdownBody source={item.body} />
      <div className="flex justify-between gap-4 text-sm">
        {neighbors.prev ? (
          <Link to={`/item/${neighbors.prev.id}`}>← {neighbors.prev.title}</Link>
        ) : (
          <span />
        )}
        {neighbors.next ? (
          <Link to={`/item/${neighbors.next.id}`}>{neighbors.next.title} →</Link>
        ) : null}
      </div>
    </article>
  )
}
