import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../ui/Card'

interface VolumeByMuscleProps {
  data: Record<string, number>
}

export function VolumeByMuscle({ data }: VolumeByMuscleProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([muscle, volume]) => ({ muscle, volume: Math.round(volume) }))

  if (chartData.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold">Volume per Muscle</h3>
        <p className="text-xs text-[var(--text-secondary)]">No data yet — complete a workout first.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Volume per Muscle (4 weeks)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="muscle" width={70} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="volume" fill="var(--accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
