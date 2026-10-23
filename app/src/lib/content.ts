import type { Catalog, Item, ItemKind } from './types'

export type Topic = {
  id: string
  title: string
  notes: string
  items: Item[]
  trackId: string
  trackTitle: string
}

const TRACK_ORDER = [
  'data-science',
  'statistics',
  'numerical-methods',
  'ml-business',
  'deep-learning',
  'nlp',
  'computer-vision',
  'time-series',
]

type TopicFile = { id?: string; title?: string; trackId?: string }
type TrackFile = { id?: string; title?: string; topics?: { id: string }[] }

function payload<T>(mod: T | { default: T }): T {
  if (mod && typeof mod === 'object' && 'default' in (mod as object)) {
    return (mod as { default: T }).default
  }
  return mod as T
}

const noteFiles = import.meta.glob('../../../content/**/notes.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const itemFiles = import.meta.glob('../../../content/**/items.json', {
  eager: true,
}) as Record<string, { default: Catalog } | Catalog>

const topicFiles = import.meta.glob('../../../content/**/topic.json', {
  eager: true,
}) as Record<string, { default: TopicFile } | TopicFile>

const trackFiles = import.meta.glob('../../../content/*/track.json', {
  eager: true,
}) as Record<string, { default: TrackFile } | TrackFile>

function folderKey(path: string): string {
  return path.replace(/\/(?:notes\.md|items\.json|topic\.json)$/, '')
}

const tracksById = new Map<string, { id: string; title: string; order: string[] }>()
for (const [path, mod] of Object.entries(trackFiles)) {
  const meta = payload(mod)
  const id = meta.id ?? path.split('/').at(-2) ?? ''
  tracksById.set(id, {
    id,
    title: meta.title ?? id,
    order: (meta.topics ?? []).map((topic) => topic.id),
  })
}

const grouped = new Map<
  string,
  { notes?: string; items?: Item[]; meta?: TopicFile; trackFolder: string }
>()
for (const [path, notes] of Object.entries(noteFiles)) {
  const folder = folderKey(path)
  grouped.set(folder, { notes, trackFolder: folder.split('/').at(-2) ?? '' })
}
for (const [path, mod] of Object.entries(itemFiles)) {
  const row = grouped.get(folderKey(path))
  if (row) row.items = payload(mod).items
}
for (const [path, mod] of Object.entries(topicFiles)) {
  const row = grouped.get(folderKey(path))
  if (row) row.meta = payload(mod)
}

function buildTopics(): Topic[] {
  const topics = [...grouped.values()].map((row) => {
    const trackId = row.meta?.trackId ?? row.trackFolder
    const track = tracksById.get(trackId)
    return {
      id: row.meta?.id ?? row.trackFolder,
      title: row.meta?.title ?? track?.title ?? trackId,
      notes: row.notes ?? '',
      items: row.items ?? [],
      trackId,
      trackTitle: track?.title ?? trackId,
    }
  })
  return topics.sort((a, b) => {
    const trackA = TRACK_ORDER.indexOf(a.trackId)
    const trackB = TRACK_ORDER.indexOf(b.trackId)
    const left = trackA === -1 ? 99 : trackA
    const right = trackB === -1 ? 99 : trackB
    if (left !== right) return left - right
    const orderA = tracksById.get(a.trackId)?.order.indexOf(a.id) ?? -1
    const orderB = tracksById.get(b.trackId)?.order.indexOf(b.id) ?? -1
    return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
  })
}

export const TOPICS: Topic[] = buildTopics()

export const TRACKS = TRACK_ORDER.flatMap((id) => {
  const track = tracksById.get(id)
  return track ? [{ id: track.id, title: track.title }] : []
})

export const TRACK_TITLE = 'Learn Tracks'

export function getTopic(id: string | null): Topic {
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0]
}

export type TocEntry = { id: string; title: string; level: number }

export function displayHeading(raw: string): string {
  return raw
    .replace(/\$([^$]+)\$/g, (_, inner: string) => prettyMath(inner))
    .replace(/\\[()]/g, '')
    .replace(/[`*]/g, '')
    .trim()
}

export function slugifyHeading(raw: string): string {
  return displayHeading(raw)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

function prettyMath(inner: string): string {
  return inner
    .replace(/R\^2/g, 'R²')
    .replace(/\^{2}/g, '²')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}_^]/g, '')
}

export function notesToc(source: string): TocEntry[] {
  const entries: TocEntry[] = []
  let inCode = false
  for (const line of source.split('\n')) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const match = /^(#{1,2})\s+(.+)$/.exec(line)
    if (!match) continue
    entries.push({
      id: slugifyHeading(match[2]),
      title: displayHeading(match[2]),
      level: match[1].length,
    })
  }
  return entries
}

export function allItems(topic?: Topic): Item[] {
  if (topic) return topic.items
  return TOPICS.flatMap((entry) => entry.items)
}

export function getItem(id: string): { item: Item; topic: Topic } | undefined {
  for (const topic of TOPICS) {
    const item = topic.items.find((entry) => entry.id === id)
    if (item) return { item, topic }
  }
  return undefined
}

export function itemsByKind(topic: Topic, kind: ItemKind | 'all'): Item[] {
  if (kind === 'all') return topic.items
  return topic.items.filter((item) => item.kind === kind)
}

export function cardExcerpt(body: string): string {
  const line = body
    .split('\n')
    .map((row) => row.trim())
    .find(
      (row) =>
        row.length > 0 &&
        !row.startsWith('#') &&
        !row.startsWith('$$') &&
        !row.startsWith('!') &&
        !row.startsWith('```') &&
        !row.startsWith('|') &&
        !row.startsWith('<') &&
        !row.startsWith('<!--'),
    )
  if (!line) return ''
  const text = displayHeading(line.replace(/^[-*]\s+/, ''))
  return text.length > 220 ? `${text.slice(0, 217)}…` : text
}

export function allTags(topic: Topic, kind: ItemKind | 'all' = 'all'): string[] {
  const set = new Set<string>()
  for (const item of itemsByKind(topic, kind)) {
    for (const tag of item.tags) set.add(tag)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}
