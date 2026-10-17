import { useState, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { slugifyHeading } from '../lib/content'

type MdastNode = {
  type?: string
  value?: string
  children?: MdastNode[]
  data?: { hProperties?: Record<string, string> }
}

function mdastText(node: MdastNode): string {
  if (node.type === 'inlineMath' || node.type === 'math') {
    return `$${node.value ?? ''}$`
  }
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map(mdastText).join('')
}

function remarkHeadingIds() {
  return (tree: MdastNode) => {
    const walk = (node: MdastNode) => {
      if (node.type === 'heading') {
        const id = slugifyHeading(mdastText(node))
        node.data = node.data ?? {}
        node.data.hProperties = { ...(node.data.hProperties ?? {}), id }
      }
      for (const child of node.children ?? []) walk(child)
    }
    walk(tree)
  }
}

function codeText(children: unknown): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(codeText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return codeText((children as { props: { children: unknown } }).props.children)
  }
  return ''
}

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const text = codeText(children).replace(/\n$/, '')

  return (
    <div className="note-code">
      <button
        type="button"
        className="copy-btn rounded-full border border-[var(--line)] px-4 py-2 text-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1400)
        }}
      >
        {copied ? 'Скопировано' : 'Копировать'}
      </button>
      <pre>{children}</pre>
    </div>
  )
}

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-note">
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm, remarkHeadingIds]}
        rehypePlugins={[[rehypeKatex, { output: 'html' }]]}
        components={{
          h1: ({ children, id }) => <h1 id={id}>{children}</h1>,
          h2: ({ children, id }) => <h2 id={id}>{children}</h2>,
          h3: ({ children, id }) => <h3 id={id}>{children}</h3>,
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          p: ({ children }) => {
            const items = Array.isArray(children) ? children : [children]
            const hasFigure = items.some(
              (child) =>
                child &&
                typeof child === 'object' &&
                'props' in child &&
                (child as { props?: { className?: string } }).props?.className ===
                  'note-figure',
            )
            if (hasFigure) return <div className="note-block">{children}</div>
            return <p>{children}</p>
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
