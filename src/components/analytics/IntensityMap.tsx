import { Card } from '../ui/Card'

interface IntensityMapProps {
  data: Record<string, number>
}

function intensityColor(ratio: number): string {
  if (ratio >= 0.85) return '#ef4444'
  if (ratio >= 0.7) return '#f97316'
  if (ratio >= 0.55) return '#eab308'
  return '#22c55e'
}

export function IntensityMap({ data }: IntensityMapProps) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold">Intensity Map</h3>
        <p className="text-xs text-[var(--text-secondary)]">Based on reps vs RIR ratio.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Intensity Map (RIR ratio)</h3>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([muscle, ratio]) => (
          <div
            key={muscle}
            className="intensity-cell capitalize"
            style={{ backgroundColor: intensityColor(ratio), color: ratio >= 0.55 && ratio < 0.85 ? '#18181b' : 'white' }}
          >
            <div className="font-medium">{muscle}</div>
            <div className="text-[10px] opacity-80">{Math.round(ratio * 100)}%</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function MuscleEngagementTracker({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 8)
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Muscle Engagement (7 days)</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)]">No sessions in the last week.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([muscle, count]) => (
            <div key={muscle}>
              <div className="mb-0.5 flex justify-between text-xs">
                <span className="capitalize">{muscle}</span>
                <span className="text-[var(--text-secondary)]">{count} sets</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(count / max) * 100}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function StressIndexCards({
  central,
  total,
}: {
  central: number
  total: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="text-center">
        <p className="text-xs text-[var(--text-secondary)]">Central Stress</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{central}%</p>
        <p className="text-[10px] text-[var(--text-secondary)]">Compound muscle share</p>
      </Card>
      <Card className="text-center">
        <p className="text-xs text-[var(--text-secondary)]">Total Stress</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          {Math.round(total).toLocaleString()}
        </p>
        <p className="text-[10px] text-[var(--text-secondary)]">Volume × intensity</p>
      </Card>
    </div>
  )
}

export function TotalVolumeChart({ data }: { data: { week: string; volume: number }[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold">Total Volume</h3>
        <p className="text-xs text-[var(--text-secondary)]">Weekly volume trend will appear here.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Total Volume (weekly)</h3>
      <div className="flex items-end gap-1" style={{ height: 100 }}>
        {data.slice(-12).map((d) => {
          const maxVol = Math.max(...data.map((x) => x.volume), 1)
          return (
            <div key={d.week} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(d.volume / maxVol) * 80}px`,
                  backgroundColor: 'var(--accent)',
                  minHeight: 4,
                }}
              />
              <span className="text-[8px] text-[var(--text-secondary)]">{d.week.slice(-2)}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
