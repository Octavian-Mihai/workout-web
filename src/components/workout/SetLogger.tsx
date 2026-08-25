import { useState } from 'react'
import type { Movement } from '../../types/database'
import { Input } from '../ui/Input'
import { RirInput } from './RirInput'
import { Button } from '../ui/Button'

interface SetLoggerProps {
  movement: Movement
  setNumber: number
  defaultRest?: number
  onLog: (data: { weight_kg: number; reps: number; rir: number; rest_seconds: number }) => void
}

export function SetLogger({ movement, setNumber, defaultRest = 90, onLog }: SetLoggerProps) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState(2)

  const handleLog = () => {
    const weightKg = parseFloat(weight) || 0
    const repCount = parseInt(reps, 10) || 0
    if (weightKg <= 0 || repCount <= 0) return
    onLog({ weight_kg: weightKg, reps: repCount, rir, rest_seconds: defaultRest })
    setReps('')
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{movement.name}</span>
        <span className="text-xs text-[var(--text-secondary)]">Set {setNumber}</span>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Input
          label="Weight (kg)"
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Reps"
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="0"
        />
      </div>
      <RirInput value={rir} onChange={setRir} />
      <Button className="mt-3 w-full" onClick={handleLog}>
        Log Set
      </Button>
    </div>
  )
}
