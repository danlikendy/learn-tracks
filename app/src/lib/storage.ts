import type { AppNotification, Profile, ProgressMap, Theme } from './types'

const KEYS = {
  progress: 'learn-tracks.progress',
  profile: 'learn-tracks.profile',
  theme: 'learn-tracks.theme',
  notifications: 'learn-tracks.notifications',
  notifyEnabled: 'learn-tracks.notify-enabled',
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadProgress(): ProgressMap {
  return readJson<ProgressMap>(KEYS.progress, {})
}

export function saveProgress(map: ProgressMap): void {
  localStorage.setItem(KEYS.progress, JSON.stringify(map))
}

export function markSolved(id: string): ProgressMap {
  const map = loadProgress()
  const prev = map[id]
  map[id] = {
    count: (prev?.count ?? 0) + 1,
    lastAt: new Date().toISOString(),
  }
  saveProgress(map)
  return map
}

export function loadProfile(): Profile {
  return readJson<Profile>(KEYS.profile, {
    name: 'Ученик',
    goal: 'Закрепить линейные модели',
  })
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function loadTheme(): Theme {
  const stored = localStorage.getItem(KEYS.theme)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.theme, theme)
  document.documentElement.dataset.theme = theme
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

export function loadNotifications(): AppNotification[] {
  const existing = readJson<AppNotification[] | null>(KEYS.notifications, null)
  if (existing && existing.length > 0) return existing
  const seed: AppNotification[] = [
    {
      id: 'welcome',
      title: 'Learn Tracks',
      body: 'Прогресс хранится в браузере. Отмечай повторения карточек: ≥1, ≥2, ≥3, ≥5, ≥10.',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ]
  localStorage.setItem(KEYS.notifications, JSON.stringify(seed))
  return seed
}

export function saveNotifications(items: AppNotification[]): void {
  localStorage.setItem(KEYS.notifications, JSON.stringify(items))
}

export function loadNotifyEnabled(): boolean {
  return localStorage.getItem(KEYS.notifyEnabled) === '1'
}

export function saveNotifyEnabled(value: boolean): void {
  localStorage.setItem(KEYS.notifyEnabled, value ? '1' : '0')
}

export function resetProgress(): void {
  localStorage.removeItem(KEYS.progress)
}
