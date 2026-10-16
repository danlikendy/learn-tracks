import catalog from '@content/data-science/linear-models/items.json'
import notesSource from '@content/data-science/linear-models/notes.md?raw'
import type { Catalog, Item, ItemKind } from './types'

const data = catalog as Catalog

export const TOPIC_TITLE = 'Линейные модели в машинном обучении'
export const TRACK_TITLE = 'Data Science'
export const NOTES = notesSource

export type TocEntry = { id: string; title: string; level: number }

export function notesToc(): TocEntry[] {
  const entries: TocEntry[] = []
  let inCode = false
  for (const line of notesSource.split('\n')) {
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

export function allItems(): Item[] {
  return data.items
}

export function getItem(id: string): Item | undefined {
  return data.items.find((item) => item.id === id)
}

export function itemsByKind(kind: ItemKind | 'all'): Item[] {
  if (kind === 'all') return data.items
  return data.items.filter((item) => item.kind === kind)
}

export function allTags(kind: ItemKind | 'all' = 'all'): string[] {
  const set = new Set<string>()
  for (const item of itemsByKind(kind)) {
    for (const tag of item.tags) set.add(tag)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}
