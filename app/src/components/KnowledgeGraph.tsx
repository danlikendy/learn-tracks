import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { MarkdownBody } from './MarkdownBody'
import {
  CONCEPT_BY_ID,
  INITIAL_OPEN,
  ROOT_ID,
  childrenOf,
  hasChildren,
  notesFor,
  visibleFrom,
} from '../lib/knowledge'

type Point = { x: number; y: number }

const ORIGIN = 4000
const WORLD = 8000
const GAP = 22
const READ_W = 360
const READ_H = 300
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DUR = '0.42s'
const CHIP_MOTION = `left ${DUR} ${EASE}, top ${DUR} ${EASE}, opacity ${DUR} ${EASE}`
const READ_MOTION = `width ${DUR} ${EASE}, height ${DUR} ${EASE}, border-radius ${DUR} ${EASE}`

function chipSize(id: string): { w: number; h: number } {
  const label = CONCEPT_BY_ID.get(id)?.label ?? id
  const extra = hasChildren(id) ? 12 : 0
  return { w: Math.min(300, Math.max(112, 40 + extra + label.length * 8.6)), h: 38 }
}

function parentOf(id: string): string | undefined {
  for (const concept of CONCEPT_BY_ID.values()) {
    if (concept.children.includes(id)) return concept.id
  }
  return undefined
}

function hits(box: { x: number; y: number; w: number; h: number }, others: Map<string, Point>, skip: string): boolean {
  for (const [id, pos] of others) {
    if (id === skip) continue
    const size = chipSize(id)
    if (
      box.x < pos.x + size.w + GAP &&
      box.x + box.w + GAP > pos.x &&
      box.y < pos.y + size.h + GAP &&
      box.y + box.h + GAP > pos.y
    ) {
      return true
    }
  }
  return false
}

function chipCenter(id: string, laid: Map<string, Point>): { x: number; y: number } {
  const pos = laid.get(id)
  const size = chipSize(id)
  if (!pos) return { x: 0, y: 0 }
  return { x: pos.x + size.w / 2, y: pos.y + size.h / 2 }
}

function spawnAtParent(id: string, laid: Map<string, Point>): Point {
  const parent = parentOf(id)
  const size = chipSize(id)
  if (!parent) {
    const dest = laid.get(id) ?? { x: -size.w / 2, y: -size.h / 2 }
    return dest
  }
  const parentPos = laid.get(parent)
  if (!parentPos) return laid.get(id) ?? { x: 0, y: 0 }
  const parentSize = chipSize(parent)
  return {
    x: parentPos.x + parentSize.w / 2 - size.w / 2,
    y: parentPos.y + parentSize.h / 2 - size.h / 2,
  }
}

function placeChildren(parentId: string, kids: string[], laid: Map<string, Point>) {
  const missing = kids.filter((id) => !laid.has(id))
  if (!missing.length) return
  const origin = chipCenter(parentId, laid)
  const ancestor = parentOf(parentId)
  const from = ancestor ? chipCenter(ancestor, laid) : { x: 0, y: 1 }
  const base =
    parentId === ROOT_ID ? -Math.PI / 2 : Math.atan2(origin.y - from.y, origin.x - from.x)
  const span =
    parentId === ROOT_ID ? Math.PI * 2 : Math.min(Math.PI * 1.25, 0.55 + kids.length * 0.36)
  const start = parentId === ROOT_ID ? -Math.PI / 2 : base - span / 2
  kids.forEach((child, index) => {
    if (laid.has(child)) return
    const size = chipSize(child)
    const angle =
      kids.length === 1 && parentId !== ROOT_ID
        ? base
        : start + ((index + 0.5) / kids.length) * span
    let radius = parentId === ROOT_ID ? 280 : 170
    let next = { x: 0, y: 0, w: size.w, h: size.h }
    for (let step = 0; step < 28; step += 1) {
      next = {
        x: origin.x + Math.cos(angle) * radius - size.w / 2,
        y: origin.y + Math.sin(angle) * radius - size.h / 2,
        w: size.w,
        h: size.h,
      }
      if (!hits(next, laid, child)) break
      radius += 36
    }
    laid.set(child, { x: next.x, y: next.y })
  })
}

function layoutChips(visible: Set<string>, opened: Set<string>, laid: Map<string, Point>) {
  const root = chipSize(ROOT_ID)
  if (!laid.has(ROOT_ID)) laid.set(ROOT_ID, { x: -root.w / 2, y: -root.h / 2 })
  const queue = [ROOT_ID]
  const seen = new Set<string>()
  while (queue.length) {
    const id = queue.shift()!
    if (seen.has(id) || !visible.has(id)) continue
    seen.add(id)
    if (!opened.has(id)) continue
    const kids = childrenOf(id).filter((child) => visible.has(child))
    placeChildren(id, kids, laid)
    for (const child of kids) queue.push(child)
  }
}

export function KnowledgeGraph() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const laidRef = useRef(new Map<string, Point>())
  const camRef = useRef({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef<{
    x: number
    y: number
    camX: number
    camY: number
    moved: boolean
  } | null>(null)
  const fittedRef = useRef(false)
  const [opened, setOpened] = useState<Set<string>>(() => new Set(INITIAL_OPEN))
  const [reading, setReading] = useState<string | null>(null)
  const [notesShown, setNotesShown] = useState<Set<string>>(() => new Set())
  const [fading, setFading] = useState<Set<string>>(() => new Set())
  const [motionReady, setMotionReady] = useState<Set<string>>(() => visibleFrom(new Set(INITIAL_OPEN)))
  const [scaleLabel, setScaleLabel] = useState(100)

  function applyCamera() {
    const world = worldRef.current
    if (!world) return
    const cam = camRef.current
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`
  }

  const visible = visibleFrom(opened)
  layoutChips(visible, opened, laidRef.current)
  const liveIds = new Set([...visible, ...fading, ...notesShown])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (viewport && !fittedRef.current) {
      const rect = viewport.getBoundingClientRect()
      camRef.current.x = rect.width / 2 - ORIGIN
      camRef.current.y = rect.height / 2 - ORIGIN
      fittedRef.current = true
      applyCamera()
    }
  }, [])

  useLayoutEffect(() => {
    const pending = [...liveIds].filter((id) => !motionReady.has(id) && !fading.has(id))
    if (!pending.length) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setMotionReady((prev) => {
          const next = new Set(prev)
          for (const id of pending) next.add(id)
          return next
        })
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [liveIds, fading, motionReady])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const world = worldRef.current
    if (!viewport || !world || !reading) return
    const pos = laidRef.current.get(reading)
    if (!pos) return
    const view = viewport.getBoundingClientRect()
    const cam = camRef.current
    const pad = 20
    const left = cam.x + (ORIGIN + pos.x) * cam.scale
    const top = cam.y + (ORIGIN + pos.y) * cam.scale
    const right = left + READ_W * cam.scale
    const bottom = top + READ_H * cam.scale
    let dx = 0
    let dy = 0
    if (left < pad) dx = pad - left
    if (top < pad) dy = pad - top
    if (right > view.width - pad) dx = view.width - pad - right
    if (bottom > view.height - pad) dy = view.height - pad - bottom
    if (!dx && !dy) return
    world.style.transition = `transform ${DUR} ${EASE}`
    cam.x += dx
    cam.y += dy
    applyCamera()
    const timer = window.setTimeout(() => {
      world.style.transition = 'none'
    }, 420)
    return () => window.clearTimeout(timer)
  }, [reading])

  useLayoutEffect(() => {
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
      applyCamera()
    }

    function onUp() {
      dragRef.current = null
    }

    function onWheel(event: WheelEvent) {
      if ((event.target as HTMLElement).closest('[data-scroll]')) return
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const cam = camRef.current
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const next = Math.min(1.7, Math.max(0.35, cam.scale * (event.deltaY > 0 ? 0.92 : 1.08)))
      const wx = (px - cam.x) / cam.scale
      const wy = (py - cam.y) / cam.scale
      cam.scale = next
      cam.x = px - wx * next
      cam.y = py - wy * next
      applyCamera()
      setScaleLabel(Math.round(next * 100))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
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
    applyCamera()
    setScaleLabel(Math.round(next * 100))
  }

  function toggleChildren(id: string) {
    if (opened.has(id)) {
      const before = visibleFrom(opened)
      const nextOpened = new Set(opened)
      const stack = [id]
      while (stack.length) {
        const cur = stack.pop()!
        nextOpened.delete(cur)
        for (const child of childrenOf(cur)) stack.push(child)
      }
      const after = visibleFrom(nextOpened)
      const leaving = [...before].filter((item) => !after.has(item))
      if (leaving.length) setFading((fade) => new Set([...fade, ...leaving]))
      setOpened(nextOpened)
      if (reading && leaving.includes(reading)) setReading(null)
    } else {
      setOpened((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
  }

  function finishLeave(id: string) {
    setFading((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setMotionReady((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (reading !== id) {
      setNotesShown((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  function nodeStyle(id: string): CSSProperties {
    const dest = laidRef.current.get(id) ?? { x: 0, y: 0 }
    const chip = chipSize(id)
    const leaving = fading.has(id)
    const readingOpen = reading === id && !leaving
    const settled = motionReady.has(id) && !leaving
    const pos = settled ? dest : spawnAtParent(id, laidRef.current)
    const transitions = [settled || leaving ? CHIP_MOTION : 'none']
    if (readingOpen || (notesShown.has(id) && !leaving)) transitions.push(READ_MOTION)
    return {
      left: ORIGIN + pos.x,
      top: ORIGIN + pos.y,
      width: readingOpen ? READ_W : chip.w,
      height: readingOpen ? READ_H : chip.h,
      opacity: settled ? 1 : 0,
      borderRadius: readingOpen ? '1rem' : '999px',
      zIndex: readingOpen ? 8 : 1,
      transition: transitions.join(', '),
    }
  }

  function lineOpacity(targetId: string): number {
    if (fading.has(targetId)) return 0
    if (!motionReady.has(targetId)) return 0
    return 1
  }

  const edgeKeys = new Set<string>()
  for (const id of liveIds) {
    const parent = parentOf(id)
    if (parent && liveIds.has(parent)) edgeKeys.add(`${parent}>${id}`)
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-full min-h-[70vh] cursor-grab overflow-hidden active:cursor-grabbing"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-node]')) return
        if (worldRef.current) worldRef.current.style.transition = 'none'
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
        ref={worldRef}
        data-world
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{ width: WORLD, height: WORLD }}
      >
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={WORLD} height={WORLD}>
          {[...edgeKeys].map((key) => {
            const [source, target] = key.split('>')
            if (!source || !target) return null
            const a = chipCenter(source, laidRef.current)
            const b = chipCenter(target, laidRef.current)
            return (
              <line
                key={key}
                x1={ORIGIN + a.x}
                y1={ORIGIN + a.y}
                x2={ORIGIN + b.x}
                y2={ORIGIN + b.y}
                stroke="var(--line)"
                strokeWidth="1.15"
                opacity={lineOpacity(target)}
                style={{ transition: `opacity ${DUR} ${EASE}` }}
              />
            )
          })}
        </svg>
        {[...liveIds].map((id) => {
          const concept = CONCEPT_BY_ID.get(id)
          if (!concept) return null
          const kids = hasChildren(id)
          const open = opened.has(id)
          const showNotes = notesShown.has(id)
          const body = notesFor(concept)
          return (
            <div
              key={id}
              data-node
              className={`kg-card ${showNotes ? 'kg-card-open' : ''} ${id === ROOT_ID ? 'kg-card-root' : ''}`}
              style={nodeStyle(id)}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.propertyName === 'opacity' && fading.has(id)) finishLeave(id)
                if (event.propertyName === 'height' && reading !== id && !fading.has(id)) {
                  setNotesShown((prev) => {
                    if (!prev.has(id)) return prev
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                  })
                }
              }}
            >
              <div
                role="button"
                tabIndex={0}
                className="kg-card-head"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  if (reading === id) {
                    setReading(null)
                    return
                  }
                  setReading(id)
                  setNotesShown((prev) => new Set([...prev, id]))
                }}
              >
                <span className="kg-card-label whitespace-nowrap font-serif text-[13px] leading-none">
                  {concept.label}
                </span>
                {kids ? (
                  <button
                    type="button"
                    className="kg-mark"
                    aria-label={open ? 'Свернуть' : 'Раскрыть'}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleChildren(id)
                    }}
                  >
                    {open ? '−' : '+'}
                  </button>
                ) : null}
              </div>
              {showNotes ? (
                <div
                  data-scroll
                  className="kg-card-body"
                  onWheel={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {body ? <MarkdownBody source={body} /> : (
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      В конспектах этого узла пока нет отдельного раздела.
                    </p>
                  )}
                  {concept.topicId ? (
                    <Link
                      className="mt-3 inline-block text-sm text-[var(--accent)]"
                      to={{
                        pathname: '/learn',
                        search: `?topic=${concept.topicId}`,
                        hash: concept.headingId ? `#${concept.headingId}` : '',
                      }}
                    >
                      Весь раздел в конспекте
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
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
    </div>
  )
}
