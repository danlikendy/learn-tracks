import { useState, type FormEvent } from 'react'
import { allItems } from '../lib/content'
import {
  loadNotifyEnabled,
  loadProfile,
  loadProgress,
  resetProgress,
  saveNotifyEnabled,
  saveProfile,
} from '../lib/storage'

export function Account() {
  const items = allItems()
  const [profile, setProfile] = useState(loadProfile)
  const [progress, setProgress] = useState(loadProgress)
  const [notify, setNotify] = useState(loadNotifyEnabled)
  const started = items.filter((item) => (progress[item.id]?.count ?? 0) > 0)
  const ge3 = started.filter((item) => (progress[item.id]?.count ?? 0) >= 3)

  function onSave(event: FormEvent) {
    event.preventDefault()
    saveProfile(profile)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={onSave}
        className="space-y-4 rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6"
      >
        <h1 className="font-serif text-3xl">Личный кабинет</h1>
        <p className="text-sm text-[var(--muted)]">
          Профиль хранится локально в браузере. Позже его можно будет связать с
          аккаунтом.
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notify}
            onChange={async (e) => {
              const enabled = e.target.checked
              if (enabled && 'Notification' in window) {
                await Notification.requestPermission()
              }
              saveNotifyEnabled(enabled)
              setNotify(enabled)
            }}
          />
          Система уведомлений (браузер + лента)
        </label>
        <button
          type="submit"
          className="rounded-full bg-[var(--fg)] px-5 py-2 text-[var(--bg)]"
        >
          Сохранить
        </button>
      </form>
      <section className="space-y-4 rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-6">
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
