import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

function headingText(children: unknown): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(headingText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return headingText((children as { props: { children: unknown } }).props.children)
  }
  return ''
}

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-note">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { output: 'html' }]]}
        components={{
          h1: ({ children }) => {
            const text = headingText(children)
            return <h1 id={slugify(text)}>{children}</h1>
          },
          h2: ({ children }) => {
            const text = headingText(children)
            return <h2 id={slugify(text)}>{children}</h2>
          },
          h3: ({ children }) => {
            const text = headingText(children)
            return <h3 id={slugify(text)}>{children}</h3>
          },
          img: ({ src, alt }) => {
            if (!src) return null
            const base = import.meta.env.BASE_URL
            const url = src.startsWith('figures/') ? `${base}${src}` : src
            return (
              <figure className="note-figure">
                <img src={url} alt={alt ?? ''} />
                {alt ? <figcaption>{alt}</figcaption> : null}
              </figure>
            )
          },
        }}
      >
        {source}
      </Markdown>
    </div>
  )
}
