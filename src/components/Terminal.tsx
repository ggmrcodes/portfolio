import { X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { runCommand } from '../lib/terminal'

interface TerminalProps {
  open: boolean
  onClose: () => void
  onToggleTheme: () => void
}

interface Line {
  kind: 'in' | 'out'
  text: string
}

const WELCOME: Line[] = [
  { kind: 'out', text: 'hatayasit.com terminal v2.0' },
  { kind: 'out', text: 'type "help" to see what I can do' },
]

/**
 * A fake shell. State lives here (input, printed lines, command history);
 * what each command means lives in lib/terminal.ts.
 */
export function Terminal({ open, onClose, onToggleTheme }: TerminalProps) {
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>(WELCOME)
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1) // -1 = not browsing history
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // Focus the prompt whenever the terminal opens
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Keep the newest output in view
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [lines])

  function submit(e: FormEvent) {
    e.preventDefault()
    const command = input.trim()
    setInput('')
    setCursor(-1)
    if (!command) return

    const { lines: output, action } = runCommand(command)
    setHistory((h) => [command, ...h])

    if (action?.type === 'clear') {
      setLines([])
    } else {
      setLines((prev) => [...prev, { kind: 'in', text: command }, ...output.map((text) => ({ kind: 'out' as const, text }))])
    }

    if (action?.type === 'theme') onToggleTheme()
    if (action?.type === 'open') window.open(action.url, '_blank', 'noopener')
    if (action?.type === 'scroll') {
      document.getElementById(action.id)?.scrollIntoView({ behavior: 'smooth' })
      onClose()
    }
  }

  // Up / Down recall previous commands, Escape closes
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') return onClose()
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const next = e.key === 'ArrowUp' ? Math.min(cursor + 1, history.length - 1) : Math.max(cursor - 1, -1)
    setCursor(next)
    setInput(next === -1 ? '' : history[next])
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label="Terminal"
      className="terminal-enter fixed inset-x-3 bottom-3 z-50 flex h-[min(62vh,440px)] flex-col border-2 border-ink bg-panel shadow-[6px_6px_0_0_var(--accent)] sm:left-4 sm:right-auto sm:w-[600px]"
    >
      <div className="window-bar justify-between">
        <span>hatayasit@brown:~$</span>
        <button type="button" onClick={onClose} aria-label="Close terminal" className="text-muted hover:text-ink">
          <X size={14} />
        </button>
      </div>

      <div ref={logRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.kind === 'in' ? 'text-accent' : 'whitespace-pre-wrap text-ink'}>
            {line.kind === 'in' ? `❯ ${line.text}` : line.text}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t-2 border-line px-4 py-2">
        <span className="text-accent" aria-hidden="true">
          ❯
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
          placeholder="help"
          aria-label="Command"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
