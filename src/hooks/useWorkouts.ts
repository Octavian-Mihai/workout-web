import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { SessionSet, SessionWithSets, WorkoutSession } from '../types/database'
import { useAuth } from '../context/AuthProvider'

export function useWorkoutSessions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['workout-sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, program:programs(*), program_day:program_days(*)')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })

      if (error) throw error
      return data as WorkoutSession[]
    },
  })
}

export function useWorkoutSession(sessionId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['workout-session', sessionId],
    enabled: !!user && !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          program:programs(*),
          program_day:program_days(*),
          session_sets(*, movement:movements(*))
        `)
        .eq('id', sessionId!)
        .single()

      if (error) throw error
      return data as SessionWithSets
    },
  })
}

export function useSessionSetsWithMovements() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['session-sets-analytics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id, started_at, ended_at, status')
        .eq('user_id', user!.id)
        .eq('status', 'completed')

      if (sessionsError) throw sessionsError
      if (!sessions?.length) return []

      const sessionIds = sessions.map((s) => s.id)
      const { data: sets, error: setsError } = await supabase
        .from('session_sets')
        .select('*, movement:movements(*)')
        .in('session_id', sessionIds)

      if (setsError) throw setsError

      const sessionMap = Object.fromEntries(sessions.map((s) => [s.id, s]))
      return (sets ?? []).map((set) => ({
        ...set,
        session: sessionMap[set.session_id],
      })) as (SessionSet & { movement?: import('../types/database').Movement; session?: WorkoutSession })[]
    },
  })
}

export function useWorkoutMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['workout-sessions'] })
    queryClient.invalidateQueries({ queryKey: ['workout-session'] })
    queryClient.invalidateQueries({ queryKey: ['session-sets-analytics'] })
  }

  const startSession = useMutation({
    mutationFn: async (params: {
      programId?: string | null
      programDayId?: string | null
    }) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user!.id,
          program_id: params.programId ?? null,
          program_day_id: params.programDayId ?? null,
          status: 'active',
        })
        .select()
        .single()
      if (error) throw error
      return data as WorkoutSession
    },
    onSuccess: invalidate,
  })

  const finishSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const addSet = useMutation({
    mutationFn: async (set: Omit<SessionSet, 'id'>) => {
      const { data, error } = await supabase.from('session_sets').insert(set).select().single()
      if (error) throw error
      return data as SessionSet
    },
    onSuccess: invalidate,
  })

  const updateSet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SessionSet> & { id: string }) => {
      const { error } = await supabase.from('session_sets').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { startSession, finishSession, addSet, updateSet }
}

export function useBodyWeightLogs() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['body-weight-logs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_weight_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('logged_on', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useBodyWeightMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const logWeight = useMutation({
    mutationFn: async ({ weight_kg, logged_on }: { weight_kg: number; logged_on: string }) => {
      const { error } = await supabase.from('body_weight_logs').upsert(
        { user_id: user!.id, weight_kg, logged_on },
        { onConflict: 'user_id,logged_on' },
      )
      if (error) throw error
      await supabase.from('profiles').update({ body_weight_kg: weight_kg }).eq('id', user!.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['body-weight-logs'] }),
  })

  return { logWeight }
}
