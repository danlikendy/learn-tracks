import { useEffect, useRef, useState } from 'react'
import { TRACKS, TOPICS, notesToc } from '../lib/content'

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

type Particle = { x: number; y: number; vx: number; vy: number }

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
  topicId: string
  onSelectTopic: (id: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const topicIdRef = useRef(topicId)
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
    let particles: Particle[] = []
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

      const cx = width / 2
      const cy = height / 2
      const next: Node[] = []
      const trackR = Math.min(width, height) * 0.18
      TRACKS.forEach((track, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / TRACKS.length
        const x = cx + Math.cos(angle) * trackR
        const y = cy + Math.sin(angle) * trackR * 0.55
        next.push({
          id: `track:${track.id}`,
          label: track.title,
          kind: 'track',
          trackId: track.id,
          x,
          y,
          vx: 0,
          vy: 0,
          ox: x,
          oy: y,
          r: 7,
        })
      })
      const byTrack = new Map(next.map((node) => [node.trackId, node]))
      TOPICS.forEach((topic) => {
        const hub = byTrack.get(topic.trackId)
        const siblings = TOPICS.filter((entry) => entry.trackId === topic.trackId)
        const index = siblings.findIndex((entry) => entry.id === topic.id)
        const angle = (index / Math.max(siblings.length, 1)) * Math.PI * 1.2 - 0.4
        const x = (hub?.ox ?? cx) + Math.cos(angle) * 130
        const y = (hub?.oy ?? cy) + Math.sin(angle) * 58
        next.push({
          id: topic.id,
          label: topic.title,
          kind: 'topic',
          topicId: topic.id,
          trackId: topic.trackId,
          x,
          y,
          vx: 0,
          vy: 0,
          ox: x,
          oy: y,
          r: 5.5,
        })
      })
      const current = TOPICS.find((topic) => topic.id === topicIdRef.current) ?? TOPICS[0]
      const parent = next.find((node) => node.id === current.id)
      const headings = notesToc(current.notes).filter((entry) => entry.level === 2)
      headings.forEach((heading, index) => {
        const angle = (index / Math.max(headings.length, 1)) * Math.PI * 2 - Math.PI / 2
        const radius = Math.min(width * 0.28, height * 0.28)
        const x = Math.min(width - 80, Math.max(80, (parent?.ox ?? cx) + Math.cos(angle) * radius))
        const y = Math.min(height - 36, Math.max(36, (parent?.oy ?? cy) + Math.sin(angle) * radius * 0.7))
        next.push({
          id: `${current.id}:${heading.id}`,
          label: heading.title,
          kind: 'heading',
          topicId: current.id,
          headingId: heading.id,
          trackId: current.trackId,
          x,
          y,
          vx: 0,
          vy: 0,
          ox: x,
          oy: y,
          r: 3,
        })
      })
      nodes = next
      particles = Array.from({ length: 110 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }))
    }

    function step() {
      const palette = colors()
      const cam = camRef.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, width, height)
      g.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, cam.x * dpr, cam.y * dpr)

      const pointer = world(mouse.x, mouse.y)
      for (const particle of particles) {
        if (mouse.inside) {
          const dx = particle.x - pointer.x
          const dy = particle.y - pointer.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 90 / cam.scale) {
            const force = (90 / cam.scale - dist) / (90 / cam.scale)
            particle.vx += (dx / dist) * force * 0.4
            particle.vy += (dy / dist) * force * 0.4
          }
        }
        particle.vx *= 0.98
        particle.vy *= 0.98
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < -40 || particle.x > width + 40) particle.vx *= -1
        if (particle.y < -40 || particle.y > height + 40) particle.vy *= -1
      }

      g.fillStyle = palette.accent
      g.globalAlpha = 0.45
      for (const particle of particles) {
        g.beginPath()
        g.arc(particle.x, particle.y, 1.5 / cam.scale, 0, Math.PI * 2)
        g.fill()
      }
      g.globalAlpha = 0.16
      g.strokeStyle = palette.accent
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 58) {
            g.beginPath()
            g.moveTo(a.x, a.y)
            g.lineTo(b.x, b.y)
            g.stroke()
          }
        }
      }
      g.globalAlpha = 1

      for (const node of nodes) {
        if (mouse.inside) {
          const dx = node.x - pointer.x
          const dy = node.y - pointer.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 110) {
            const force = (110 - dist) / 110
            node.vx += (dx / dist) * force * 0.5
            node.vy += (dy / dist) * force * 0.5
          }
        }
        node.vx += (node.ox - node.x) * 0.04
        node.vy += (node.oy - node.y) * 0.04
        node.vx *= 0.86
        node.vy *= 0.86
        node.x += node.vx
        node.y += node.vy
      }

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

      g.textAlign = 'center'
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
          (node.kind === 'track' ? 12 : node.kind === 'topic' ? 11 : 10) / cam.scale
        g.font = `${node.kind === 'track' ? 600 : node.kind === 'topic' ? 500 : 400} ${size}px "IBM Plex Sans", system-ui`
        const max = node.kind === 'heading' ? 18 : 20
        wrapLabel(node.label, max).forEach((line, index) => {
          g.fillText(line, node.x, node.y + node.r + 5 / cam.scale + index * (size + 2))
        })
      }

      raf = requestAnimationFrame(step)
    }

    function hit(px: number, py: number) {
      const point = world(px, py)
      return [...nodes]
        .reverse()
        .find((node) => Math.hypot(node.x - point.x, node.y - point.y) < 22)
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
      className="relative -mx-4 h-72 overflow-hidden sm:-mx-0 sm:h-80 sm:rounded-3xl"
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
