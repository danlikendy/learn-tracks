import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { displayHeading, getItem, getTopic } from '../lib/content'
import {
  formatDuration,
  loadLiveSession,
  noteStudyTarget,
  startLiveSession,
  stopLiveSession,
} from '../lib/storage'
import type { StudyTarget } from '../lib/types'

function targetFromLocation(pathname: string, search: string): StudyTarget | null {
  const itemMatch = /^\/item\/([^/]+)$/.exec(pathname)
  if (itemMatch) {
    const found = getItem(itemMatch[1])
    if (!found) return null
    return {
      kind: 'card',
      id: found.item.id,
      title: displayHeading(found.item.title),
    }
  }
  if (pathname === '/learn' || pathname === '/learn/') {
    const topic = getTopic(new URLSearchParams(search).get('topic'))
    return { kind: 'module', id: topic.id, title: topic.title }
  }
  return null
}

export function SessionTimer() {
  const location = useLocation()
  const [live, setLive] = useState(loadLiveSession)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [live])

  useEffect(() => {
    if (!loadLiveSession()) return
    noteStudyTarget(targetFromLocation(location.pathname, location.search))
  }, [location.pathname, location.search])

  function toggle() {
    if (loadLiveSession()) {
      stopLiveSession()
      setLive(null)
      return
    }
    const next = startLiveSession(
      targetFromLocation(location.pathname, location.search),
    )
    setLive(next)
    setNow(Date.now())
  }

  const elapsed = live ? now - live.startedAt : 0

  return (
    <button
      type="button"
      aria-label="Таймер"
      aria-pressed={Boolean(live)}
      className={`rounded-full border px-3 py-1 tabular-nums ${
        live ? 'border-[var(--accent)]' : 'border-[var(--line)]'
      }`}
      onClick={toggle}
    >
      {live ? formatDuration(elapsed) : 'Таймер'}
    </button>
  )
}
