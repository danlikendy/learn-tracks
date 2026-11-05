import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import katex from 'katex'
import {
  CONCEPT_BY_ID,
  INITIAL_OPEN,
  ROOT_ID,
  childrenOf,
  hasChildren,
  visibleFrom,
  type Concept,
} from '../lib/knowledge'

type Laid = { id: string; x: number; y: number; w: number; h: number }

function Formula({ tex }: { tex: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    katex.render(tex, ref.current, { throwOnError: false, displayMode: true })
  }, [tex])
  return <span ref={ref} className="kg-formula" />
}

function cardSize(id: string): { w: number; h: number } {
  const label = CONCEPT_BY_ID.get(id)?.label ?? id
  const w = Math.min(280, Math.max(108, 36 + label.length * 9.1))
  return { w, h: 38 }
}

function subtreeWeight(id: string, opened: Set<string>): number {
  if (!opened.has(id)) return 1
  const kids = childrenOf(id)
  if (!kids.length) return 1
  return Math.max(
    1,
    kids.reduce((sum, child) => sum + subtreeWeight(child, opened), 0),
  )
}

function layoutRadial(visible: Set<string>, opened: Set<string>): Map<string, Laid> {
  const laid = new Map<string, Laid>()
  const placed = new Set<string>()

  function place(
    id: string,
    x: number,
    y: number,
    fromAngle: number,
    sweep: number,
  ) {
    if (placed.has(id) || !visible.has(id)) return
    const size = cardSize(id)
    laid.set(id, { id, x: x - size.w / 2, y: y - size.h / 2, w: size.w, h: size.h })
    placed.add(id)
    if (!opened.has(id)) return
    const kids = childrenOf(id).filter((child) => visible.has(child) && !placed.has(child))
    if (!kids.length) return
    const weights = kids.map((child) => subtreeWeight(child, opened))
    const total = weights.reduce((sum, w) => sum + w, 0)
    const span = id === ROOT_ID ? Math.PI * 2 : Math.min(Math.PI * 1.35, 0.55 + kids.length * 0.38)
    const start = id === ROOT_ID ? -Math.PI / 2 : fromAngle - span / 2
    const widest = Math.max(...kids.map((child) => cardSize(child).w))
    const radius = Math.max(
      id === ROOT_ID ? 250 : 150,
      (kids.length * (widest + 28)) / Math.max(span, 0.6),
    )
    let cursor = start
    kids.forEach((child, index) => {
      const slice = (weights[index] / total) * span
      const angle = cursor + slice / 2
      place(
        child,
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius,
        angle,
        slice,
      )
      cursor += slice
    })
  }

  place(ROOT_ID, 0, 0, 0, Math.PI * 2)
  return laid
}

function parentOf(id: string): string | undefined {
  for (const concept of CONCEPT_BY_ID.values()) {
    if (concept.children.includes(id)) return concept.id
  }
  return undefined
}

export function KnowledgeGraph() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const camRef = useRef({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef<{
    x: number
    y: number
    camX: number
    camY: number
    moved: boolean
  } | null>(null)
  const [opened, setOpened] = useState<Set<string>>(() => new Set(INITIAL_OPEN))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [entering, setEntering] = useState<Set<string>>(() => new Set())
  const [scaleLabel, setScaleLabel] = useState(100)
  const prevVisible = useRef<Set<string>>(new Set([ROOT_ID, ...childrenOf(ROOT_ID)]))
  const fittedRef = useRef(false)

  const visible = useMemo(() => visibleFrom(opened), [opened])
  const laid = useMemo(() => layoutRadial(visible, opened), [visible, opened])
  const edges = useMemo(() => {
    const list: [string, string][] = []
    for (const id of visible) {
      if (!opened.has(id)) continue
      for (const child of childrenOf(id)) {
        if (visible.has(child) && laid.has(id) && laid.has(child)) list.push([id, child])
      }
    }
    return list
  }, [visible, opened, laid])

  const bounds = useMemo(() => {
    let minX = -240
    let maxX = 240
    let minY = -240
    let maxY = 240
    for (const box of laid.values()) {
      minX = Math.min(minX, box.x)
      maxX = Math.max(maxX, box.x + box.w)
      minY = Math.min(minY, box.y)
      maxY = Math.max(maxY, box.y + box.h)
    }
    return { minX: minX - 48, minY: minY - 48, maxX: maxX + 48, maxY: maxY + 48 }
  }, [laid])

  useEffect(() => {
    const next = new Set<string>()
    for (const id of visible) {
      if (!prevVisible.current.has(id)) next.add(id)
    }
    prevVisible.current = visible
    setEntering(next)
    if (!next.size) return
    const timer = window.setTimeout(() => setEntering(new Set()), 420)
    return () => window.clearTimeout(timer)
  }, [visible])

  function applyCamera(viewport: HTMLDivElement) {
    const world = viewport.querySelector<HTMLElement>('[data-world]')
    if (!world) return
    const cam = camRef.current
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    if (!fittedRef.current) {
      camRef.current.x = rect.width / 2 + bounds.minX
      camRef.current.y = rect.height / 2 + bounds.minY
      fittedRef.current = true
    }
    applyCamera(viewport)
  }, [bounds])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onMove(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag) return
      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      if (Math.hypot(dx, dy) > 4) drag.moved = true
      camRef.current.x = drag.camX + dx
      camRef.current.y = drag.camY + dy
      applyCamera(viewport!)
    }

    function onUp() {
      dragRef.current = null
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const rect = viewport!.getBoundingClientRect()
      const cam = camRef.current
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const next = Math.min(1.7, Math.max(0.35, cam.scale * (event.deltaY > 0 ? 0.92 : 1.08)))
      const wx = (px - cam.x) / cam.scale
      const wy = (py - cam.y) / cam.scale
      cam.scale = next
      cam.x = px - wx * next
      cam.y = py - wy * next
      applyCamera(viewport!)
      setScaleLabel(Math.round(next * 100))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      viewport.removeEventListener('wheel', onWheel)
    }
  }, [])

  function zoomBy(factor: number) {
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    const cam = camRef.current
    const px = rect.width / 2
    const py = rect.height / 2
    const next = Math.min(1.7, Math.max(0.35, cam.scale * factor))
    const wx = (px - cam.x) / cam.scale
    const wy = (py - cam.y) / cam.scale
    cam.scale = next
    cam.x = px - wx * next
    cam.y = py - wy * next
    applyCamera(viewport)
    setScaleLabel(Math.round(next * 100))
  }

  function toggle(id: string) {
    setSelectedId(id)
    if (!hasChildren(id)) return
    setOpened((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        const stack = [id]
        while (stack.length) {
          const cur = stack.pop()!
          next.delete(cur)
          for (const child of childrenOf(cur)) stack.push(child)
        }
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selected: Concept | undefined = selectedId ? CONCEPT_BY_ID.get(selectedId) : undefined
  const selectedKids = selected ? childrenOf(selected.id) : []
  const worldW = bounds.maxX - bounds.minX
  const worldH = bounds.maxY - bounds.minY

  return (
    <div
      ref={viewportRef}
      className="relative h-full min-h-[70vh] cursor-grab overflow-hidden active:cursor-grabbing"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-node],[data-panel]')) return
        dragRef.current = {
          x: event.clientX,
          y: event.clientY,
          camX: camRef.current.x,
          camY: camRef.current.y,
          moved: false,
        }
      }}
    >
      <div
        data-world
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: worldW,
          height: worldH,
        }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={worldW}
          height={worldH}
        >
          {edges.map(([parent, child]) => {
            const a = laid.get(parent)
            const b = laid.get(child)
            if (!a || !b) return null
            const x1 = a.x - bounds.minX + a.w / 2
            const y1 = a.y - bounds.minY + a.h / 2
            const x2 = b.x - bounds.minX + b.w / 2
            const y2 = b.y - bounds.minY + b.h / 2
            return (
              <line
                key={`${parent}->${child}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--line)"
                strokeWidth="1.15"
              />
            )
          })}
        </svg>
        {[...visible].map((id) => {
          const concept = CONCEPT_BY_ID.get(id)
          const box = laid.get(id)
          if (!concept || !box) return null
          const open = opened.has(id)
          const kids = hasChildren(id)
          const active = selectedId === id
          return (
            <button
              key={id}
              type="button"
              data-node
              className={`kg-card ${entering.has(id) ? 'kg-card-in' : ''} ${active ? 'kg-card-active' : ''} ${id === ROOT_ID ? 'kg-card-root' : ''}`}
              style={{
                left: box.x - bounds.minX,
                top: box.y - bounds.minY,
                width: box.w,
                height: box.h,
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (dragRef.current?.moved) return
                toggle(id)
              }}
            >
              <span className="block whitespace-nowrap font-serif text-[13px] leading-none">
                {concept.label}
              </span>
              {kids ? (
                <span className="kg-mark">{open ? '−' : '+'}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm"
          onClick={() => zoomBy(0.9)}
        >
          −
        </button>
        <span className="text-xs text-[var(--muted)]">{scaleLabel}%</span>
        <button
          type="button"
          className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm"
          onClick={() => zoomBy(1.1)}
        >
          +
        </button>
      </div>

      {selected ? (
        <aside data-panel className="kg-panel">
          <div className="flex items-start justify-between gap-3">
            <p className="font-serif text-xl leading-snug">{selected.label}</p>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]"
              onClick={() => setSelectedId(null)}
            >
              Закрыть
            </button>
          </div>
          {selected.blurb ? (
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{selected.blurb}</p>
          ) : null}
          {selected.formula ? <Formula tex={selected.formula} /> : null}
          {selectedKids.length ? (
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">Дальше</p>
              <div className="flex flex-wrap gap-2">
                {selectedKids.map((id) => {
                  const child = CONCEPT_BY_ID.get(id)
                  if (!child) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
                      onClick={() => {
                        setOpened((prev) => new Set(prev).add(selected.id))
                        setSelectedId(id)
                      }}
                    >
                      {child.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex flex-col items-start gap-2">
            {parentOf(selected.id) ? (
              <button
                type="button"
                className="text-sm text-[var(--muted)]"
                onClick={() => setSelectedId(parentOf(selected.id) ?? null)}
              >
                ← {CONCEPT_BY_ID.get(parentOf(selected.id) ?? '')?.label}
              </button>
            ) : null}
            {selected.topicId ? (
              <Link
                className="text-sm text-[var(--accent)]"
                to={{
                  pathname: '/learn',
                  search: `?topic=${selected.topicId}`,
                  hash: selected.headingId ? `#${selected.headingId}` : '',
                }}
              >
                Открыть в конспекте
              </Link>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  )
}
