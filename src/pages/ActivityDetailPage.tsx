import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { YearActivityGrid } from '../components/activity/YearActivityGrid'
import { Card } from '../components/ui/Card'
import { PageShell } from '../components/layout/PageShell'
import { useAnalytics } from '../hooks/useAnalytics'

export function ActivityDetailPage() {
  const { analytics, isLoading } = useAnalytics()

  const dayData = Object.entries(analytics.dayOfWeekStats).map(([day, count]) => ({
    day,
    count,
  }))

  const topDay = dayData.reduce((best, d) => (d.count > best.count ? d : best), dayData[0])

  return (
    <PageShell title="Activity Details">
      <div className="space-y-4">
        <YearActivityGrid activeDays={analytics.activeDays} linkToDetail={false} />

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Current Streak</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {analytics.streaks.current}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">days</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Longest Streak</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {analytics.streaks.longest}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">days</p>
          </Card>
        </div>

        <Card>
          <p className="text-xs text-[var(--text-secondary)]">Average session duration</p>
          <p className="text-xl font-bold">{analytics.averageDuration} min</p>
        </Card>

        {!isLoading && topDay && topDay.count > 0 && (
          <Card>
            <p className="text-sm">
              You train most on <strong>{topDay.day}</strong> ({topDay.count} sessions).
            </p>
          </Card>
        )}

        <Card>
          <h3 className="mb-3 text-sm font-semibold">Workouts by Day of Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold">Monthly Comparison</h3>
          {analytics.monthlyComparison.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No completed workouts yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.monthlyComparison.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span>{m.month}</span>
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>
                    {m.count} workouts
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
