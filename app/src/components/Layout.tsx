import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { loadNotifications, loadTheme, saveTheme } from '../lib/storage'
import type { Theme } from '../lib/types'

const primary: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Обучение', end: true },
  { to: '/community', label: 'Сообщество' },
  { to: '/roadmaps', label: 'Роадмапы' },
  { to: '/reviews', label: 'Обзоры' },
]

const account: { to: string; label: string; end?: boolean }[] = [
  { to: '/account', label: 'Кабинет' },
  { to: '/notifications', label: 'Уведомления' },
]

function linkClass(isActive: boolean): string {
  return `rounded-full px-3 py-1 ${isActive ? 'bg-[var(--bg-elev)] text-[var(--fg)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`
}

export function Layout() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const [unread, setUnread] = useState(
    () => loadNotifications().filter((n) => !n.read).length,
  )

  useEffect(() => {
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    const sync = () =>
      setUnread(loadNotifications().filter((n) => !n.read).length)
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <NavLink to="/" className="shrink-0 font-serif text-lg tracking-tight">
            Learn Tracks
          </NavLink>
          <nav className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex">
            {primary.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => linkClass(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-1 text-sm md:flex">
            {account.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => linkClass(isActive)}
              >
                {link.label}
                {link.to === '/notifications' && unread > 0 ? (
                  <span className="ml-1 text-[var(--accent)]">{unread}</span>
                ) : null}
              </NavLink>
            ))}
            <button
              type="button"
              className="ml-2 rounded-full border border-[var(--line)] px-3 py-1"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Светлая' : 'Тёмная'}
            </button>
          </div>
          <button
            type="button"
            className="ml-auto rounded-full border border-[var(--line)] px-3 py-1 text-sm md:hidden"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Светлая' : 'Тёмная'}
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 text-sm md:hidden">
          {[...primary, ...account].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 ${linkClass(isActive)}`
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
