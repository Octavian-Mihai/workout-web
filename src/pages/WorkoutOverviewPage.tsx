import { useNavigate } from 'react-router-dom'
import { YearActivityGrid } from '../components/activity/YearActivityGrid'
import { OneRmChart } from '../components/analytics/OneRmChart'
import {
  IntensityMap,
  MuscleEngagementTracker,
  StressIndexCards,
  TotalVolumeChart,
} from '../components/analytics/IntensityMap'
import { VolumeByMuscle } from '../components/analytics/VolumeByMuscle'
import { Button } from '../components/ui/Button'
import { PageShell } from '../components/layout/PageShell'
import { useAnalytics } from '../hooks/useAnalytics'

export function WorkoutOverviewPage() {
  const navigate = useNavigate()
  const { analytics, isLoading } = useAnalytics()

  return (
    <PageShell title="Workout">
      <div className="space-y-4">
        <Button className="w-full" onClick={() => navigate('/workout/program/new')}>
          Create New Program
        </Button>

        <YearActivityGrid activeDays={analytics.activeDays} compact />

        {isLoading ? (
          <p className="text-center text-sm text-[var(--text-secondary)]">Loading analytics…</p>
        ) : (
          <>
            <StressIndexCards
              central={analytics.centralStressIndex}
              total={analytics.totalStressIndex}
            />
            <VolumeByMuscle data={analytics.muscleVolumes} />
            <TotalVolumeChart data={analytics.weeklyVolumes} />
            <OneRmChart trends={analytics.oneRmTrends} />
            <MuscleEngagementTracker data={analytics.muscleEngagement} />
            <IntensityMap data={analytics.intensityByMuscle} />
          </>
        )}
      </div>
    </PageShell>
  )
}
