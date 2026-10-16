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
