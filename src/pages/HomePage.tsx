import { useNavigate } from 'react-router-dom'
import { YearActivityGrid } from '../components/activity/YearActivityGrid'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageShell } from '../components/layout/PageShell'
import { estimateWorkoutDuration } from '../lib/analytics'
import { useAnalytics } from '../hooks/useAnalytics'
import { getNextWorkout, usePrograms } from '../hooks/usePrograms'
import { useWorkoutMutations, useWorkoutSessions } from '../hooks/useWorkouts'

export function HomePage() {
  const navigate = useNavigate()
  const { analytics } = useAnalytics()
  const { data: programs = [] } = usePrograms()
  const { data: sessions = [] } = useWorkoutSessions()
  const { startSession } = useWorkoutMutations()

  const nextWorkout = getNextWorkout(programs, sessions)

  const handleStartProgrammed = async () => {
    if (!nextWorkout) return
    const session = await startSession.mutateAsync({
      programId: nextWorkout.program.id,
      programDayId: nextWorkout.day.id,
    })
    navigate(`/workout/active/${session.id}`)
  }

  const handleStartEmpty = async () => {
    const session = await startSession.mutateAsync({})
    navigate(`/workout/active/${session.id}`)
  }

  const exerciseCount = nextWorkout?.day.program_day_exercises.length ?? 0
  const totalSets = nextWorkout?.day.program_day_exercises.reduce((s, e) => s + e.target_sets, 0) ?? 0
  const estimatedMin = estimateWorkoutDuration(exerciseCount, totalSets)

  return (
    <PageShell title="Home">
      <div className="space-y-4">
        <YearActivityGrid activeDays={analytics.activeDays} />

        {nextWorkout ? (
          <Card>
            <p className="text-xs font-medium text-[var(--text-secondary)]">Next Workout</p>
            <h2 className="mt-1 text-lg font-semibold">
              {nextWorkout.program.name} — {nextWorkout.day.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {exerciseCount} exercises · ~{estimatedMin} min
            </p>
            <ul className="mt-2 space-y-1">
              {nextWorkout.day.program_day_exercises.slice(0, 4).map((ex) => (
                <li key={ex.id} className="text-xs text-[var(--text-secondary)]">
                  {ex.movement?.name ?? 'Exercise'} — {ex.target_sets}×{ex.target_reps}
                </li>
              ))}
              {exerciseCount > 4 && (
                <li className="text-xs text-[var(--text-secondary)]">+{exerciseCount - 4} more</li>
              )}
            </ul>
            <Button
              className="mt-4 w-full"
              onClick={handleStartProgrammed}
              disabled={startSession.isPending}
            >
              Start Workout
            </Button>
          </Card>
        ) : (
          <Card>
            <h2 className="text-sm font-semibold">No program yet</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Create a program on the Workout page to get workout previews here.
            </p>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => navigate('/workout/program/new')}>
              Create Program
            </Button>
          </Card>
        )}

        <Button variant="secondary" className="w-full" onClick={handleStartEmpty} disabled={startSession.isPending}>
          Start Empty Workout
        </Button>
      </div>
    </PageShell>
  )
}
