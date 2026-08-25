import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type {
  Movement,
  ProgramDay,
  ProgramDayExercise,
  ProgramWithDays,
  RotationType,
} from '../types/database'
import { useAuth } from '../context/AuthProvider'

export function useMovements() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['movements', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user!.id}`)
        .order('name')
      if (error) throw error
      return data as Movement[]
    },
  })
}

export function usePrograms() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['programs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          program_days(
            *,
            program_day_exercises(*, movement:movements(*))
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []).map((p) => ({
        ...p,
        program_days: (p.program_days ?? []).sort(
          (a: ProgramDay, b: ProgramDay) => a.day_order - b.day_order,
        ),
      })) as ProgramWithDays[]
    },
  })
}

export function useProgram(programId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['program', programId],
    enabled: !!user && !!programId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          program_days(
            *,
            program_day_exercises(*, movement:movements(*))
          )
        `)
        .eq('id', programId!)
        .single()

      if (error) throw error
      return {
        ...data,
        program_days: (data.program_days ?? []).sort(
          (a: ProgramDay, b: ProgramDay) => a.day_order - b.day_order,
        ),
      } as ProgramWithDays
    },
  })
}

export interface ProgramDayInput {
  label: string
  exercises: {
    movement_id: string
    target_sets: number
    target_reps: number
    target_rir: number
  }[]
}

export function useProgramMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['programs'] })
    queryClient.invalidateQueries({ queryKey: ['program'] })
  }

  const saveProgram = useMutation({
    mutationFn: async ({
      id,
      name,
      rotation_type,
      days,
    }: {
      id?: string
      name: string
      rotation_type: RotationType
      days: ProgramDayInput[]
    }) => {
      let programId = id

      if (programId) {
        const { error } = await supabase
          .from('programs')
          .update({ name, rotation_type })
          .eq('id', programId)
        if (error) throw error

        const { data: existingDays } = await supabase
          .from('program_days')
          .select('id')
          .eq('program_id', programId)
        if (existingDays?.length) {
          await supabase.from('program_days').delete().in(
            'id',
            existingDays.map((d) => d.id),
          )
        }
      } else {
        const { data, error } = await supabase
          .from('programs')
          .insert({ user_id: user!.id, name, rotation_type })
          .select()
          .single()
        if (error) throw error
        programId = data.id
      }

      for (let i = 0; i < days.length; i++) {
        const day = days[i]
        const { data: dayData, error: dayError } = await supabase
          .from('program_days')
          .insert({ program_id: programId!, day_order: i, label: day.label })
          .select()
          .single()
        if (dayError) throw dayError

        if (day.exercises.length > 0) {
          const exercises = day.exercises.map((ex, idx) => ({
            program_day_id: dayData.id,
            movement_id: ex.movement_id,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            target_rir: ex.target_rir,
            exercise_order: idx,
          }))
          const { error: exError } = await supabase.from('program_day_exercises').insert(exercises)
          if (exError) throw exError
        }
      }

      return programId!
    },
    onSuccess: invalidate,
  })

  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase.from('programs').delete().eq('id', programId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { saveProgram, deleteProgram }
}

export function getNextProgramDay(
  program: ProgramWithDays,
  completedSessions: { program_day_id: string | null; ended_at: string | null }[],
): (ProgramDay & { program_day_exercises: ProgramDayExercise[] }) | null {
  const days = program.program_days
  if (days.length === 0) return null

  const programSessions = completedSessions
    .filter((s) => s.program_day_id && s.ended_at)
    .sort((a, b) => new Date(b.ended_at!).getTime() - new Date(a.ended_at!).getTime())

  if (programSessions.length === 0) return days[0]

  const lastDayId = programSessions[0].program_day_id
  const lastIndex = days.findIndex((d) => d.id === lastDayId)
  if (lastIndex === -1) return days[0]

  const nextIndex = (lastIndex + 1) % days.length
  return days[nextIndex]
}

export function getNextWorkout(programs: ProgramWithDays[], sessions: { program_id: string | null; program_day_id: string | null; ended_at: string | null; status: string }[]) {
  if (programs.length === 0) return null

  const activeProgram = programs[0]
  const completed = sessions.filter((s) => s.status === 'completed')
  const nextDay = getNextProgramDay(activeProgram, completed)

  if (!nextDay) return null

  return {
    program: activeProgram,
    day: nextDay,
  }
}
