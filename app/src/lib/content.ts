import linearItems from '@content/data-science/linear-models/items.json'
import linearNotes from '@content/data-science/linear-models/notes.md?raw'
import qualityItems from '@content/data-science/supervised-quality/items.json'
import qualityNotes from '@content/data-science/supervised-quality/notes.md?raw'
import type { Catalog, Item, ItemKind } from './types'

export type Topic = {
  id: string
  title: string
  notes: string
  items: Item[]
}

export const TRACK_TITLE = 'Data Science'

export const TOPICS: Topic[] = [
  {
    id: 'linear-models',
    title: 'Линейные модели в машинном обучении',
    notes: linearNotes,
    items: (linearItems as Catalog).items,
  },
  {
    id: 'supervised-quality',
    title: 'Обучение с учителем: качество модели',
    notes: qualityNotes,
    items: (qualityItems as Catalog).items,
  },
]

export function getTopic(id: string | null): Topic {
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0]
}

export type TocEntry = { id: string; title: string; level: number }

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
    const title = match[2].replace(/\$/g, '').replace(/\\[()]/g, '').trim()
    const id = title
      .toLowerCase()
      .replace(/[`*]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '')
    entries.push({ id, title, level: match[1].length })
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

export function allTags(topic: Topic, kind: ItemKind | 'all' = 'all'): string[] {
  const set = new Set<string>()
  for (const item of itemsByKind(topic, kind)) {
    for (const tag of item.tags) set.add(tag)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}
