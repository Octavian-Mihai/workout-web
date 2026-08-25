import { useMemo } from 'react'
import { subWeeks } from 'date-fns'
import {
  BIG_LIFTS,
  computeAverageDuration,
  computeCentralStressIndex,
  computeDayOfWeekStats,
  computeIntensityByMuscle,
  computeMonthlyComparison,
  computeMuscleEngagement,
  computeMuscleVolume,
  computeOneRmTrend,
  computeStreaks,
  computeTotalStressIndex,
  computeTotalVolume,
  computeWeeklyVolumes,
  getActivityDays,
} from '../lib/analytics'
import { useSessionSetsWithMovements, useWorkoutSessions } from './useWorkouts'

export function useAnalytics() {
  const { data: sessions = [], isLoading: sessionsLoading } = useWorkoutSessions()
  const { data: sets = [], isLoading: setsLoading } = useSessionSetsWithMovements()

  const analytics = useMemo(() => {
    const activeDays = getActivityDays(sessions)
    const fourWeeksAgo = subWeeks(new Date(), 4)
    const recentSets = sets.filter((s) => {
      const ended = s.session?.ended_at
      return ended && new Date(ended) >= fourWeeksAgo
    })

    const muscleVolumes = computeMuscleVolume(recentSets)
    const weeklyVolumes = computeWeeklyVolumes(
      sessions
        .filter((s) => s.status === 'completed')
        .map((s) => ({
          ...s,
          session_sets: sets.filter((set) => set.session_id === s.id),
        })),
    )

    const oneRmTrends = Object.fromEntries(
      BIG_LIFTS.map((lift) => [lift, computeOneRmTrend(sets, lift)]),
    )

    return {
      activeDays,
      muscleVolumes,
      totalVolume: computeTotalVolume(recentSets),
      weeklyVolumes,
      muscleEngagement: computeMuscleEngagement(sets, 7),
      intensityByMuscle: computeIntensityByMuscle(recentSets),
      centralStressIndex: computeCentralStressIndex(muscleVolumes),
      totalStressIndex: computeTotalStressIndex(recentSets),
      oneRmTrends,
      dayOfWeekStats: computeDayOfWeekStats(sessions),
      averageDuration: computeAverageDuration(sessions),
      streaks: computeStreaks(activeDays),
      monthlyComparison: computeMonthlyComparison(sessions),
    }
  }, [sessions, sets])

  return { analytics, isLoading: sessionsLoading || setsLoading, sessions, sets }
}
