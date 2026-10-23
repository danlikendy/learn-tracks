import type {
  AppNotification,
  LiveSession,
  Profile,
  ProgressMap,
  StudySession,
  StudyTarget,
  Theme,
} from './types'

const KEYS = {
  progress: 'learn-tracks.progress',
  profile: 'learn-tracks.profile',
  theme: 'learn-tracks.theme',
  notifications: 'learn-tracks.notifications',
  notifyEnabled: 'learn-tracks.notify-enabled',
  favorites: 'learn-tracks.favorites',
  sessions: 'learn-tracks.sessions',
  liveSession: 'learn-tracks.session-live',
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

export function adjustCount(id: string, delta: number): ProgressMap {
  const map = loadProgress()
  const next = Math.max(0, (map[id]?.count ?? 0) + delta)
  if (next === 0) delete map[id]
  else map[id] = { count: next, lastAt: new Date().toISOString() }
  saveProgress(map)
  return map
}

export function markSolved(id: string): ProgressMap {
  return adjustCount(id, 1)
}

export function loadFavorites(): string[] {
  const raw = readJson<unknown>(KEYS.favorites, [])
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === 'string')
}

export function toggleFavorite(id: string): string[] {
  const next = new Set(loadFavorites())
  if (next.has(id)) next.delete(id)
  else next.add(id)
  const list = [...next]
  localStorage.setItem(KEYS.favorites, JSON.stringify(list))
  return list
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

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function loadSessions(): StudySession[] {
  const raw = readJson<unknown>(KEYS.sessions, [])
  if (!Array.isArray(raw)) return []
  return raw.filter((row): row is StudySession => {
    if (!row || typeof row !== 'object') return false
    const session = row as StudySession
    return typeof session.id === 'string' && Array.isArray(session.visits)
  })
}

export function saveSessionComment(id: string, comment: string): StudySession[] {
  const next = loadSessions().map((session) =>
    session.id === id ? { ...session, comment } : session,
  )
  localStorage.setItem(KEYS.sessions, JSON.stringify(next))
  return next
}

export function loadLiveSession(): LiveSession | null {
  const raw = readJson<LiveSession | null>(KEYS.liveSession, null)
  if (!raw || typeof raw.startedAt !== 'number') return null
  return raw
}

function saveLiveSession(live: LiveSession | null): void {
  if (!live) localStorage.removeItem(KEYS.liveSession)
  else localStorage.setItem(KEYS.liveSession, JSON.stringify(live))
}

function flushCurrent(live: LiveSession, now: number): void {
  if (!live.current) return
  const ms = Math.max(0, now - live.current.enteredAt)
  const found = live.visits.find(
    (visit) => visit.kind === live.current?.kind && visit.id === live.current.id,
  )
  if (found) found.ms += ms
  else {
    live.visits.push({
      kind: live.current.kind,
      id: live.current.id,
      title: live.current.title,
      ms,
    })
  }
  live.current = null
}

export function startLiveSession(target: StudyTarget | null): LiveSession {
  const now = Date.now()
  const live: LiveSession = {
    startedAt: now,
    visits: [],
    current: target ? { ...target, enteredAt: now } : null,
  }
  saveLiveSession(live)
  return live
}

export function noteStudyTarget(target: StudyTarget | null): void {
  const live = loadLiveSession()
  if (!live) return
  const now = Date.now()
  if (
    live.current &&
    target &&
    live.current.kind === target.kind &&
    live.current.id === target.id
  ) {
    return
  }
  flushCurrent(live, now)
  live.current = target ? { ...target, enteredAt: now } : null
  saveLiveSession(live)
}

export function stopLiveSession(): StudySession | null {
  const live = loadLiveSession()
  if (!live) return null
  const now = Date.now()
  flushCurrent(live, now)
  const session: StudySession = {
    id: `s-${live.startedAt}`,
    startedAt: new Date(live.startedAt).toISOString(),
    endedAt: new Date(now).toISOString(),
    durationMs: Math.max(0, now - live.startedAt),
    comment: '',
    visits: live.visits.filter((visit) => visit.ms > 0),
  }
  const next = [session, ...loadSessions()]
  localStorage.setItem(KEYS.sessions, JSON.stringify(next))
  saveLiveSession(null)
  window.dispatchEvent(new Event('learn-tracks-sessions'))
  return session
}
