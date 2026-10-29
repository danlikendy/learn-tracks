import { useEffect, useRef, useState } from 'react'
import { TRACKS, TOPICS } from '../lib/content'

type Node = {
  id: string
  label: string
  kind: 'track' | 'topic' | 'heading'
  topicId?: string
  headingId?: string
  trackId?: string
  x: number
  y: number
  vx: number
  vy: number
  ox: number
  oy: number
  r: number
}

function wrapLabel(text: string, max: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > max && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

export function KnowledgeGraph({
  topicId,
  onSelectTopic,
}: {
  topicId: string | null
  onSelectTopic: (id: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const topicIdRef = useRef<string | null>(topicId)
  const onSelectRef = useRef(onSelectTopic)
  const camRef = useRef({ x: 0, y: 0, scale: 1 })
  const zoomFnRef = useRef<(factor: number) => void>(() => {})
  const [scaleLabel, setScaleLabel] = useState(100)
  topicIdRef.current = topicId
  onSelectRef.current = onSelectTopic

  useEffect(() => {
    const canvasEl = canvasRef.current
    const wrapEl = wrapRef.current
    if (!canvasEl || !wrapEl) return
    const drawn = canvasEl.getContext('2d')
    if (!drawn) return
    const canvas: HTMLCanvasElement = canvasEl
    const wrap: HTMLDivElement = wrapEl
    const g: CanvasRenderingContext2D = drawn

    const mouse = { x: 0, y: 0, inside: false }
    const drag = { active: false, moved: false, x: 0, y: 0, camX: 0, camY: 0 }
    let nodes: Node[] = []
    let raf = 0
    let width = 0
    let height = 0

    function colors() {
      const styles = getComputedStyle(document.documentElement)
      return {
        fg: styles.getPropertyValue('--fg').trim() || '#1c1917',
        muted: styles.getPropertyValue('--muted').trim() || '#57534e',
        accent: styles.getPropertyValue('--accent').trim() || '#8b5a2b',
        line: styles.getPropertyValue('--line').trim() || '#e7e0d4',
      }
    }

    function world(px: number, py: number) {
      const cam = camRef.current
      return { x: (px - cam.x) / cam.scale, y: (py - cam.y) / cam.scale }
    }

    function zoomAt(px: number, py: number, factor: number) {
      const cam = camRef.current
      const next = Math.min(10, Math.max(0.4, cam.scale * factor))
      const wx = (px - cam.x) / cam.scale
      const wy = (py - cam.y) / cam.scale
      cam.scale = next
      cam.x = px - wx * next
      cam.y = py - wy * next
      setScaleLabel(Math.round(next * 100))
    }

    function layout() {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(320, rect.width)
      height = Math.max(220, rect.height)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const cols = 3
      const colW = width / cols
      const rowH = height / 3
      const next: Node[] = []
      TRACKS.forEach((track, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const topics = TOPICS.filter((topic) => topic.trackId === track.id)
        const x = col * colW + 28
        const top = row * rowH + 32
        const lone = topics.length === 1 && topics[0].title === track.title
        if (lone) {
          const topic = topics[0]
          next.push({
            id: topic.id,
            label: topic.title,
            kind: 'topic',
            topicId: topic.id,
            trackId: track.id,
            x,
            y: top + 8,
            vx: 0,
            vy: 0,
            ox: x,
            oy: top + 8,
            r: 6,
          })
          return
        }
        next.push({
          id: `track:${track.id}`,
          label: track.title,
          kind: 'track',
          trackId: track.id,
          x,
          y: top,
          vx: 0,
          vy: 0,
          ox: x,
          oy: top,
          r: 6.5,
        })
        topics.forEach((topic, topicIndex) => {
          const y = top + 52 + topicIndex * 64
          next.push({
            id: topic.id,
            label: topic.title,
            kind: 'topic',
            topicId: topic.id,
            trackId: track.id,
            x,
            y,
            vx: 0,
            vy: 0,
            ox: x,
            oy: y,
            r: 5,
          })
        })
      })
      nodes = next
    }

    function step() {
      const palette = colors()
      const cam = camRef.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, width, height)
      g.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, cam.x * dpr, cam.y * dpr)

      g.lineWidth = 1 / cam.scale
      g.strokeStyle = palette.line
      for (const track of nodes.filter((node) => node.kind === 'track')) {
        for (const topic of nodes) {
          if (topic.kind !== 'topic' || topic.trackId !== track.trackId) continue
          g.beginPath()
          g.moveTo(track.x, track.y)
          g.lineTo(topic.x, topic.y)
          g.stroke()
        }
      }
      const currentTopic = nodes.find(
        (node) => node.kind === 'topic' && node.topicId === topicIdRef.current,
      )
      if (currentTopic) {
        g.globalAlpha = 0.5
        for (const node of nodes) {
          if (node.kind !== 'heading') continue
          g.beginPath()
          g.moveTo(currentTopic.x, currentTopic.y)
          g.lineTo(node.x, node.y)
          g.stroke()
        }
        g.globalAlpha = 1
      }

      g.textAlign = 'left'
      g.textBaseline = 'top'
      for (const node of nodes) {
        const active = node.kind === 'topic' && node.topicId === topicIdRef.current
        g.beginPath()
        g.fillStyle = node.kind === 'track' || active ? palette.accent : palette.fg
        g.globalAlpha = node.kind === 'heading' ? 0.7 : 1
        g.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        g.fill()
        g.globalAlpha = 1
        g.fillStyle = node.kind === 'heading' ? palette.muted : palette.fg
        const size =
          (node.kind === 'track' ? 13 : node.kind === 'topic' ? 12 : 10) / cam.scale
        g.font = `${node.kind === 'track' ? 600 : node.kind === 'topic' ? 500 : 400} ${size}px "IBM Plex Sans", system-ui`
        const max = node.kind === 'heading' ? 22 : 32
        wrapLabel(node.label, max).forEach((line, index) => {
          g.fillText(
            line,
            node.x + node.r + 8 / cam.scale,
            node.y - size * 0.35 + index * (size + 2),
          )
        })
      }

      raf = requestAnimationFrame(step)
    }

    function hit(px: number, py: number) {
      const point = world(px, py)
      return [...nodes]
        .reverse()
        .find((node) => {
          const dx = point.x - node.x
          const dy = point.y - node.y
          if (Math.hypot(dx, dy) < 18) return true
          return dx > 0 && dx < 260 && Math.abs(dy) < 16
        })
    }

    function onMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
      mouse.inside = true
      if (drag.active) {
        const dx = mouse.x - drag.x
        const dy = mouse.y - drag.y
        if (Math.hypot(dx, dy) > 4) drag.moved = true
        camRef.current.x = drag.camX + dx
        camRef.current.y = drag.camY + dy
        canvas.style.cursor = 'grabbing'
        return
      }
      canvas.style.cursor = hit(mouse.x, mouse.y) ? 'pointer' : 'grab'
    }

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return
      const rect = canvas.getBoundingClientRect()
      drag.active = true
      drag.moved = false
      drag.x = event.clientX - rect.left
      drag.y = event.clientY - rect.top
      drag.camX = camRef.current.x
      drag.camY = camRef.current.y
      canvas.setPointerCapture(event.pointerId)
    }

    function onUp(event: PointerEvent) {
      const wasDrag = drag.moved
      drag.active = false
      canvas.releasePointerCapture(event.pointerId)
      canvas.style.cursor = 'grab'
      if (wasDrag) return
      const rect = canvas.getBoundingClientRect()
      const node = hit(event.clientX - rect.left, event.clientY - rect.top)
      if (node?.topicId) {
        onSelectRef.current(node.topicId)
        if (node.headingId) {
          requestAnimationFrame(() => {
            document.getElementById(node.headingId ?? '')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          })
        }
        return
      }
      if (node?.kind === 'track') {
        const first = TOPICS.find((topic) => topic.trackId === node.trackId)
        if (first) onSelectRef.current(first.id)
      }
    }

    function onLeave() {
      mouse.inside = false
      if (!drag.active) canvas.style.cursor = 'default'
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY > 0 ? 0.9 : 1.12)
    }

    const observer = new ResizeObserver(layout)
    observer.observe(wrap)
    layout()
    raf = requestAnimationFrame(step)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    zoomFnRef.current = (factor) => zoomAt(width / 2, height / 2, factor)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [topicId])

  function bump(factor: number) {
    zoomFnRef.current(factor)
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full min-h-[70vh] overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm"
          onClick={() => bump(0.88)}
        >
          −
        </button>
        <span className="text-xs text-[var(--muted)]">{scaleLabel}%</span>
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm"
          onClick={() => bump(1.14)}
        >
          +
        </button>
      </div>
    </div>
  )
}
