import { useNavigate } from 'react-router-dom'
import { buildYearGrid } from '../../lib/analytics'
import { Card } from '../ui/Card'

interface YearActivityGridProps {
  activeDays: Set<string>
  compact?: boolean
  linkToDetail?: boolean
}

export function YearActivityGrid({ activeDays, compact = false, linkToDetail = true }: YearActivityGridProps) {
  const navigate = useNavigate()
  const weeks = buildYearGrid(activeDays)
  const totalActive = activeDays.size

  return (
    <Card
      onClick={linkToDetail ? () => navigate('/workout/activity') : undefined}
      className={compact ? 'p-3' : ''}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Activity</h2>
        <span className="text-xs text-[var(--text-secondary)]">{totalActive} workouts this year</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" style={{ minWidth: compact ? 280 : 320 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`activity-dot ${day.active ? 'active' : ''}`}
                  title={day.date}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {linkToDetail && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">Tap for trends and details →</p>
      )}
    </Card>
  )
}
