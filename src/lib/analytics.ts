import { differenceInMinutes, format, getDay, parseISO, startOfDay, subDays } from 'date-fns'
import type { Movement, SessionSet, WorkoutSession } from '../types/database'

export const BIG_LIFTS = ['Barbell Back Squat', 'Barbell Bench Press', 'Barbell Deadlift', 'Overhead Press']

export function estimateOneRm(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}

export function intensityRatio(reps: number, rir: number): number {
  const total = reps + rir
  if (total <= 0) return 0
  return reps / total
}

export function computeSetVolume(set: SessionSet): number {
  return set.weight_kg * set.reps
}

export function computeMuscleVolume(
  sets: (SessionSet & { movement?: Movement })[],
): Record<string, number> {
  const volumes: Record<string, number> = {}
  for (const set of sets) {
    const muscles = set.movement?.primary_muscles ?? ['unknown']
    const share = computeSetVolume(set) / muscles.length
    for (const muscle of muscles) {
      volumes[muscle] = (volumes[muscle] ?? 0) + share
    }
  }
  return volumes
}

export function computeTotalVolume(sets: SessionSet[]): number {
  return sets.reduce((sum, set) => sum + computeSetVolume(set), 0)
}

export function computeWeeklyVolumes(
  sessions: (WorkoutSession & { session_sets: SessionSet[] })[],
): { week: string; volume: number }[] {
  const byWeek: Record<string, number> = {}
  for (const session of sessions) {
    if (!session.ended_at) continue
    const weekKey = format(parseISO(session.ended_at), 'yyyy-ww')
    byWeek[weekKey] = (byWeek[weekKey] ?? 0) + computeTotalVolume(session.session_sets)
  }
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, volume]) => ({ week, volume }))
}

export function computeOneRmTrend(
  sets: (SessionSet & { movement?: Movement; session?: WorkoutSession })[],
  movementName: string,
): { date: string; oneRm: number }[] {
  const bySession = new Map<string, number>()
  for (const set of sets) {
    if (set.movement?.name !== movementName) continue
    const sessionDate = set.session?.ended_at ?? set.session?.started_at
    if (!sessionDate) continue
    const oneRm = estimateOneRm(set.weight_kg, set.reps)
    const key = format(parseISO(sessionDate), 'yyyy-MM-dd')
    bySession.set(key, Math.max(bySession.get(key) ?? 0, oneRm))
  }
  return Array.from(bySession.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, oneRm]) => ({ date, oneRm: Math.round(oneRm * 10) / 10 }))
}

export function computeMuscleEngagement(
  sets: (SessionSet & { movement?: Movement })[],
  days = 7,
): Record<string, number> {
  const cutoff = subDays(new Date(), days)
  const engagement: Record<string, number> = {}
  for (const set of sets) {
    const muscles = set.movement?.primary_muscles ?? []
    for (const muscle of muscles) {
      engagement[muscle] = (engagement[muscle] ?? 0) + 1
    }
  }
  void cutoff
  return engagement
}

export function computeIntensityByMuscle(
  sets: (SessionSet & { movement?: Movement })[],
): Record<string, number> {
  const totals: Record<string, { sum: number; count: number }> = {}
  for (const set of sets) {
    const muscles = set.movement?.primary_muscles ?? ['unknown']
    const ratio = intensityRatio(set.reps, set.rir)
    for (const muscle of muscles) {
      if (!totals[muscle]) totals[muscle] = { sum: 0, count: 0 }
      totals[muscle].sum += ratio
      totals[muscle].count += 1
    }
  }
  const result: Record<string, number> = {}
  for (const [muscle, { sum, count }] of Object.entries(totals)) {
    result[muscle] = count > 0 ? sum / count : 0
  }
  return result
}

const CENTRAL_MUSCLES = ['quads', 'glutes', 'hamstrings', 'chest', 'back', 'shoulders', 'core']

export function computeCentralStressIndex(muscleVolumes: Record<string, number>): number {
  let central = 0
  let total = 0
  for (const [muscle, volume] of Object.entries(muscleVolumes)) {
    total += volume
    if (CENTRAL_MUSCLES.includes(muscle.toLowerCase())) {
      central += volume
    }
  }
  return total > 0 ? Math.round((central / total) * 100) : 0
}

export function computeTotalStressIndex(
  sets: (SessionSet & { movement?: Movement })[],
): number {
  return sets.reduce((sum, set) => {
    const intensity = intensityRatio(set.reps, set.rir)
    return sum + computeSetVolume(set) * intensity
  }, 0)
}

export function getActivityDays(sessions: WorkoutSession[]): Set<string> {
  const days = new Set<string>()
  for (const session of sessions) {
    if (session.status !== 'completed' || !session.ended_at) continue
    days.add(format(parseISO(session.ended_at), 'yyyy-MM-dd'))
  }
  return days
}

export function buildYearGrid(activeDays: Set<string>): { date: string; active: boolean }[][] {
  const today = startOfDay(new Date())
  const weeks: { date: string; active: boolean }[][] = []
  let currentWeek: { date: string; active: boolean }[] = []

  for (let i = 0; i <= 52 * 7; i++) {
    const date = subDays(today, 52 * 7 - i)
    const key = format(date, 'yyyy-MM-dd')
    currentWeek.push({ date: key, active: activeDays.has(key) })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)
  return weeks
}

export function computeDayOfWeekStats(sessions: WorkoutSession[]): Record<string, number> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]))
  for (const session of sessions) {
    if (session.status !== 'completed' || !session.ended_at) continue
    const dayName = days[getDay(parseISO(session.ended_at))]
    counts[dayName] += 1
  }
  return counts
}

export function computeAverageDuration(sessions: WorkoutSession[]): number {
  const durations = sessions
    .filter((s) => s.status === 'completed' && s.ended_at)
    .map((s) => differenceInMinutes(parseISO(s.ended_at!), parseISO(s.started_at)))
  if (durations.length === 0) return 0
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export function computeStreaks(activeDays: Set<string>): { current: number; longest: number } {
  let current = 0
  let longest = 0
  let streak = 0
  const today = startOfDay(new Date())

  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd')
    if (activeDays.has(date)) {
      streak += 1
      if (i === 0 || (i > 0 && streak === i + 1 - (current > 0 ? 0 : 0))) {
        if (i < 7) current = streak
      }
    } else {
      longest = Math.max(longest, streak)
      if (i === 0) current = 0
      streak = 0
    }
  }
  longest = Math.max(longest, streak)

  // Recalculate current streak from today backwards
  current = 0
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd')
    if (activeDays.has(date)) current += 1
    else break
  }

  return { current, longest }
}

export function computeMonthlyComparison(sessions: WorkoutSession[]): { month: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const session of sessions) {
    if (session.status !== 'completed' || !session.ended_at) continue
    const month = format(parseISO(session.ended_at), 'MMM yyyy')
    counts[month] = (counts[month] ?? 0) + 1
  }
  return Object.entries(counts)
    .slice(-6)
    .map(([month, count]) => ({ month, count }))
}

export function estimateWorkoutDuration(exerciseCount: number, totalSets: number): number {
  return Math.round(exerciseCount * 5 + totalSets * 3)
}
