declare module '@content/data-science/linear-models/items.json' {
  const value: {
    topicId: string
    trackId: string
    items: Array<{
      id: string
      kind: 'theory' | 'practice'
      title: string
      tags: string[]
      body: string
    }>
  }
  export default value
}

declare module '*.md?raw' {
  const source: string
  export default source
}
