import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RestTimer } from '../components/workout/RestTimer'
import { SetLogger } from '../components/workout/SetLogger'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageShell } from '../components/layout/PageShell'
import { useMovements, useProgram } from '../hooks/usePrograms'
import { useWorkoutMutations, useWorkoutSession } from '../hooks/useWorkouts'
import type { Movement } from '../types/database'

export function ActiveWorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: session, isLoading } = useWorkoutSession(sessionId)
  const { data: movements = [] } = useMovements()
  const { data: program } = useProgram(session?.program_id ?? undefined)
  const { addSet, finishSession } = useWorkoutMutations()

  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [showAddExercise, setShowAddExercise] = useState(false)

  if (isLoading || !session) {
    return (
      <PageShell title="Workout" showNav={false}>
        <p className="text-center text-sm text-[var(--text-secondary)]">Loading session…</p>
      </PageShell>
    )
  }

  const programExercises =
    program?.program_days
      .find((d) => d.id === session.program_day_id)
      ?.program_day_exercises.sort((a, b) => a.exercise_order - b.exercise_order) ?? []

  const loggedByMovement = session.session_sets.reduce<Record<string, number>>((acc, set) => {
    acc[set.movement_id] = (acc[set.movement_id] ?? 0) + 1
    return acc
  }, {})

  const handleLogSet = async (
    movement: Movement,
    data: { weight_kg: number; reps: number; rir: number; rest_seconds: number },
  ) => {
    const setNumber = (loggedByMovement[movement.id] ?? 0) + 1
    await addSet.mutateAsync({
      session_id: session.id,
      movement_id: movement.id,
      set_number: setNumber,
      weight_kg: data.weight_kg,
      reps: data.reps,
      rir: data.rir,
      rest_seconds: data.rest_seconds,
    })
    setRestSeconds(data.rest_seconds)
    setSelectedMovement(null)
  }

  const handleFinish = async () => {
    await finishSession.mutateAsync(session.id)
    navigate('/')
  }

  return (
    <PageShell
      title={session.program_day?.label ?? 'Active Workout'}
      showNav={false}
      action={
        <Button variant="ghost" onClick={handleFinish}>
          Finish
        </Button>
      }
    >
      <div className="space-y-4">
        {programExercises.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Program Exercises</h2>
            {programExercises.map((ex) => {
              const movement = ex.movement!
              const completed = loggedByMovement[movement.id] ?? 0
              const isActive = selectedMovement?.id === movement.id
              return (
                <Card key={ex.id} className={isActive ? 'ring-2 ring-[var(--accent)]' : ''}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{movement.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Target: {ex.target_sets}×{ex.target_reps} @ RIR {ex.target_rir} · Done: {completed}/{ex.target_sets}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedMovement(isActive ? null : movement)}
                    >
                      {isActive ? 'Close' : 'Log'}
                    </Button>
                  </div>
                  {isActive && (
                    <div className="mt-3">
                      <SetLogger
                        movement={movement}
                        setNumber={completed + 1}
                        onLog={(data) => handleLogSet(movement, data)}
                      />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {session.session_sets.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Logged Sets</h2>
            <div className="space-y-1">
              {session.session_sets.map((set) => (
                <div
                  key={set.id}
                  className="flex justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-xs"
                >
                  <span>{set.movement?.name ?? 'Exercise'}</span>
                  <span className="text-[var(--text-secondary)]">
                    {set.weight_kg}kg × {set.reps} @ RIR {set.rir}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="secondary" className="w-full" onClick={() => setShowAddExercise(!showAddExercise)}>
          {showAddExercise ? 'Hide Exercises' : 'Add Exercise'}
        </Button>

        {showAddExercise && (
          <div className="space-y-2">
            {movements.map((m) => (
              <button
                key={m.id}
                type="button"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-left text-sm"
                onClick={() => {
                  setSelectedMovement(m)
                  setShowAddExercise(false)
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {selectedMovement && !programExercises.some((e) => e.movement_id === selectedMovement.id) && (
          <SetLogger
            movement={selectedMovement}
            setNumber={(loggedByMovement[selectedMovement.id] ?? 0) + 1}
            onLog={(data) => handleLogSet(selectedMovement, data)}
          />
        )}
      </div>

      {restSeconds !== null && restSeconds > 0 && (
        <RestTimer
          seconds={restSeconds}
          onComplete={() => setRestSeconds(null)}
          onSkip={() => setRestSeconds(null)}
        />
      )}
    </PageShell>
  )
}

export function NewWorkoutPage() {
  const navigate = useNavigate()
  const { startSession } = useWorkoutMutations()

  useEffect(() => {
    startSession.mutateAsync({}).then((session) => {
      navigate(`/workout/active/${session.id}`, { replace: true })
    })
  }, [])

  return (
    <PageShell title="New Workout" showNav={false}>
      <p className="text-center text-sm text-[var(--text-secondary)]">Starting empty workout…</p>
    </PageShell>
  )
}
