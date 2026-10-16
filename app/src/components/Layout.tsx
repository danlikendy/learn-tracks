import { NavLink, Outlet } from 'react-router-dom'
import { loadNotifications, loadTheme, saveTheme } from '../lib/storage'
import type { Theme } from '../lib/types'
import { useEffect, useMemo, useState } from 'react'

const links = [
  { to: '/', label: 'Обучение', end: true },
  { to: '/learn/theory', label: 'Теория' },
  { to: '/learn/practice', label: 'Практика' },
  { to: '/account', label: 'Кабинет' },
  { to: '/notifications', label: 'Уведомления' },
  { to: '/community', label: 'Сообщество' },
  { to: '/roadmaps', label: 'Роадмапы' },
  { to: '/reviews', label: 'Обзоры' },
]

export function Layout() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const unread = useMemo(
    () => loadNotifications().filter((n) => !n.read).length,
    [],
  )

  useEffect(() => {
    saveTheme(theme)
  }, [theme])

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="font-serif text-lg tracking-tight">
            Learn Tracks
          </NavLink>
          <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 text-sm md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 ${isActive ? 'bg-[var(--bg-elev)] text-[var(--fg)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`
                }
              >
                {link.label}
                {link.to === '/notifications' && unread > 0 ? (
                  <span className="ml-1 text-[var(--accent)]">{unread}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Светлая' : 'Тёмная'}
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 text-sm md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1 ${isActive ? 'bg-[var(--bg-elev)]' : 'text-[var(--muted)]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
