import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../ui/Card'

interface OneRmChartProps {
  trends: Record<string, { date: string; oneRm: number }[]>
}

export function OneRmChart({ trends }: OneRmChartProps) {
  const liftsWithData = Object.entries(trends).filter(([, data]) => data.length > 0)

  if (liftsWithData.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold">1RM Evolution</h3>
        <p className="text-xs text-[var(--text-secondary)]">Log big lifts to see estimated 1RM trends.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">1RM Evolution (estimated)</h3>
      <div className="space-y-4">
        {liftsWithData.map(([lift, data]) => (
          <div key={lift}>
            <p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">{lift}</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} hide />
                <YAxis tick={{ fontSize: 9 }} width={35} />
                <Tooltip />
                <Line type="monotone" dataKey="oneRm" stroke="var(--accent)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </Card>
  )
}
