export type ItemKind = 'theory' | 'practice'

export type Item = {
  id: string
  kind: ItemKind
  title: string
  tags: string[]
  body: string
}

export type Catalog = {
  topicId: string
  trackId: string
  items: Item[]
}

export type ProgressMap = Record<
  string,
  { count: number; lastAt: string }
>

export type Profile = {
  name: string
  goal: string
}

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export type Theme = 'light' | 'dark'

export type SessionVisit = {
  kind: 'card' | 'module'
  id: string
  title: string
  ms: number
}

export type StudySession = {
  id: string
  startedAt: string
  endedAt: string
  durationMs: number
  comment: string
  visits: SessionVisit[]
}

export type StudyTarget = {
  kind: 'card' | 'module'
  id: string
  title: string
}

export type LiveSession = {
  startedAt: number
  visits: SessionVisit[]
  current: (StudyTarget & { enteredAt: number }) | null
}
