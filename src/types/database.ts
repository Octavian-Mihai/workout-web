export type ThemeMode = 'light' | 'dark'
export type RotationType = 'sequential' | 'weekly'
export type SessionStatus = 'active' | 'completed'

export interface Profile {
  id: string
  display_name: string | null
  accent_color: string
  theme_mode: ThemeMode
  body_weight_kg: number | null
  created_at: string
}

export interface Movement {
  id: string
  name: string
  primary_muscles: string[]
  secondary_muscles: string[]
  category: string
  is_system: boolean
  user_id: string | null
}

export interface Program {
  id: string
  user_id: string
  name: string
  rotation_type: RotationType
  created_at: string
}

export interface ProgramDay {
  id: string
  program_id: string
  day_order: number
  label: string
}

export interface ProgramDayExercise {
  id: string
  program_day_id: string
  movement_id: string
  target_sets: number
  target_reps: number
  target_rir: number
  exercise_order: number
  movement?: Movement
}

export interface WorkoutSession {
  id: string
  user_id: string
  program_id: string | null
  program_day_id: string | null
  started_at: string
  ended_at: string | null
  status: SessionStatus
  program?: Program
  program_day?: ProgramDay
}

export interface SessionSet {
  id: string
  session_id: string
  movement_id: string
  set_number: number
  weight_kg: number
  reps: number
  rir: number
  rest_seconds: number | null
  movement?: Movement
}

export interface BodyWeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_on: string
}

export interface ProgramWithDays extends Program {
  program_days: (ProgramDay & { program_day_exercises: ProgramDayExercise[] })[]
}

export interface SessionWithSets extends WorkoutSession {
  session_sets: SessionSet[]
}
