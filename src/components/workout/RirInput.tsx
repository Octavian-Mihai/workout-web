interface RirInputProps {
  value: number
  onChange: (value: number) => void
}

function getRirClass(rir: number): string {
  if (rir <= 0) return 'rir-0'
  if (rir <= 2) return `rir-${Math.min(2, Math.round(rir))}`
  if (rir <= 4) return `rir-${Math.round(rir)}`
  return 'rir-5plus'
}

export function RirInput({ value, onChange }: RirInputProps) {
  const options = [0, 1, 2, 3, 4, 5]

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">RIR</span>
      <div className="flex gap-1">
        {options.map((rir) => (
          <button
            key={rir}
            type="button"
            onClick={() => onChange(rir)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-opacity ${
              value === rir ? getRirClass(rir) : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
          >
            {rir === 5 ? '5+' : rir}
          </button>
        ))}
      </div>
    </div>
  )
}

export function getRirLabel(rir: number): string {
  if (rir <= 0) return 'Failure'
  if (rir <= 2) return 'Hard'
  if (rir <= 4) return 'Moderate'
  return 'Easy'
}
