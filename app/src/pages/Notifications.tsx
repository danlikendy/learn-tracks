import { useState } from 'react'
import {
  loadNotifications,
  saveNotifications,
} from '../lib/storage'

export function NotificationsPage() {
  const [items, setItems] = useState(loadNotifications)

  function markAllRead() {
    const next = items.map((item) => ({ ...item, read: true }))
    saveNotifications(next)
    setItems(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Уведомления</h1>
        <button
          type="button"
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
          onClick={markAllRead}
        >
          Прочитать все
        </button>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5"
          >
            <p className="text-xs text-[var(--muted)]">
              {new Date(item.createdAt).toLocaleString('ru')}
              {item.read ? '' : ' · новое'}
            </p>
            <h2 className="mt-1 font-serif text-xl">{item.title}</h2>
            <p className="mt-2 text-[var(--muted)]">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
