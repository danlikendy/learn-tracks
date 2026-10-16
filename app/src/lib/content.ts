import catalog from '@content/data-science/linear-models/items.json'
import type { Catalog, Item, ItemKind } from './types'

const data = catalog as Catalog

export const TOPIC_TITLE = 'Линейные модели в машинном обучении'
export const TRACK_TITLE = 'Data Science'

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
