import { useEffect, useId, useRef, useState } from 'react'

type Option = { value: string; label: string }

export function Select({
  value,
  options,
  onChange,
}: {
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const current = options.find((option) => option.value === value)

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={root} className="relative inline-block max-w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        className="select-control min-w-[14rem] max-w-full text-left"
        onClick={() => setOpen(!open)}
      >
        {current?.label ?? value}
      </button>
      {open ? (
        <ul
          id={id}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-max min-w-full max-w-[min(28rem,90vw)] overflow-auto rounded-xl border border-[var(--line)] bg-[var(--bg)] py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`block w-full px-3 py-2 text-left text-sm ${option.value === value ? 'bg-[var(--bg-elev)]' : 'hover:bg-[var(--bg-elev)]'}`}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
