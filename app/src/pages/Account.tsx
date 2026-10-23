import { useEffect, useState, type FormEvent } from 'react'
import { allItems } from '../lib/content'
import {
  formatDuration,
  loadNotifyEnabled,
  loadProfile,
  loadProgress,
  loadSessions,
  resetProgress,
  saveNotifyEnabled,
  saveProfile,
  saveSessionComment,
} from '../lib/storage'

export function Account() {
  const items = allItems()
  const [profile, setProfile] = useState(loadProfile)
  const [progress, setProgress] = useState(loadProgress)
  const [notify, setNotify] = useState(loadNotifyEnabled)
  const [sessions, setSessions] = useState(loadSessions)
  const started = items.filter((item) => (progress[item.id]?.count ?? 0) > 0)
  const ge3 = started.filter((item) => (progress[item.id]?.count ?? 0) >= 3)

  useEffect(() => {
    const sync = () => setSessions(loadSessions())
    window.addEventListener('learn-tracks-sessions', sync)
    return () => window.removeEventListener('learn-tracks-sessions', sync)
  }, [])

  function onSave(event: FormEvent) {
    event.preventDefault()
    saveProfile(profile)
  }

  return (
    <div className="flex flex-col gap-12">
      <form onSubmit={onSave} className="max-w-xl space-y-4">
        <h1 className="font-serif text-3xl">Личный кабинет</h1>
        <p className="text-sm text-[var(--muted)]">
          Профиль хранится локально в браузере.
        </p>
        <label className="block text-sm">
          Имя
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Цель закрепления
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          />
        </label>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            role="switch"
            aria-checked={notify}
            className={`relative h-6 w-10 shrink-0 rounded-full border ${
              notify
                ? 'border-[var(--fg)] bg-[var(--fg)]'
                : 'border-[var(--line)] bg-[var(--bg)]'
            }`}
            onClick={async () => {
              const enabled = !notify
              if (enabled && 'Notification' in window) {
                await Notification.requestPermission()
              }
              saveNotifyEnabled(enabled)
              setNotify(enabled)
            }}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full ${
                notify
                  ? 'right-0.5 bg-[var(--bg)]'
                  : 'left-0.5 bg-[var(--muted)]'
              }`}
            />
          </button>
          Система уведомлений (браузер + лента)
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--fg)] px-5 py-2 text-[var(--bg)]"
        >
          Сохранить
        </button>
      </form>

      <section className="max-w-xl space-y-4">
        <h2 className="font-serif text-2xl">Сессии</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Запустите таймер справа сверху.
          </p>
        ) : (
          <ul className="space-y-8">
            {sessions.map((session) => (
              <li key={session.id} className="space-y-3">
                <p className="text-sm text-[var(--muted)]">
                  {new Date(session.startedAt).toLocaleString('ru')} ·{' '}
                  {formatDuration(session.durationMs)}
                </p>
                {session.visits.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {session.visits.map((visit) => {
                      const share =
                        session.durationMs > 0
                          ? Math.round((visit.ms / session.durationMs) * 100)
                          : 0
                      return (
                        <li key={`${visit.kind}-${visit.id}`}>
                          {visit.kind === 'card' ? 'карточка' : 'модуль'}{' '}
                          {visit.title} — {formatDuration(visit.ms)} ({share}%)
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                <textarea
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Комментарий"
                  defaultValue={session.comment}
                  onBlur={(event) => {
                    setSessions(
                      saveSessionComment(session.id, event.target.value),
                    )
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-xl space-y-3">
        <h2 className="font-serif text-2xl">Прогресс</h2>
        <p>Повторяли хотя бы раз: {started.length} / {items.length}</p>
        <p>Довели до ≥3: {ge3.length}</p>
        <button
          type="button"
          className="rounded-full border border-[var(--line)] px-5 py-2"
          onClick={() => {
            resetProgress()
            setProgress({})
          }}
        >
          Сбросить прогресс
        </button>
      </section>
    </div>
  )
}
