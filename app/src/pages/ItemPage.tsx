import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { allItems, getItem } from '../lib/content'
import { loadProgress, markSolved } from '../lib/storage'

export function ItemPage() {
  const { id } = useParams()
  const item = id ? getItem(id) : undefined
  const [count, setCount] = useState(
    () => (id ? loadProgress()[id]?.count ?? 0 : 0),
  )

  const neighbors = useMemo(() => {
    if (!item) return { prev: undefined, next: undefined }
    const list = allItems().filter((entry) => entry.kind === item.kind)
    const index = list.findIndex((entry) => entry.id === item.id)
    return { prev: list[index - 1], next: list[index + 1] }
  }, [item])

  if (!item) {
    return <p>Карточка не найдена.</p>
  }

  const back = item.kind === 'theory' ? '/?view=theory' : '/?view=practice'

  return (
    <article className="flex flex-col gap-6">
      <Link to={back} className="w-fit text-sm text-[var(--muted)]">
        Назад к {item.kind === 'theory' ? 'теории' : 'практике'}
      </Link>
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6">
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
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6 sm:p-8">
        <MarkdownBody source={item.body} />
      </div>
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
