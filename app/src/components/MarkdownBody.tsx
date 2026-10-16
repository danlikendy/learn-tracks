import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-note space-y-3 text-[0.98rem] leading-7">
      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {source}
      </Markdown>
    </div>
  )
}
