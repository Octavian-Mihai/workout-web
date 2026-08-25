import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

interface RestTimerProps {
  seconds: number
  onComplete: () => void
  onSkip: () => void
}

export function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate(200)
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onComplete])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-lg px-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-center shadow-lg">
        <p className="text-xs font-medium text-[var(--text-secondary)]">Rest Timer</p>
        <p className="my-2 text-3xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
          {mins}:{secs.toString().padStart(2, '0')}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setRemaining((r) => r + 30)}>
            +30s
          </Button>
          <Button variant="primary" className="flex-1" onClick={onSkip}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
