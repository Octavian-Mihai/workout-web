import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { PageShell } from '../components/layout/PageShell'
import {
  useMovements,
  useProgram,
  useProgramMutations,
  type ProgramDayInput,
} from '../hooks/usePrograms'
import type { RotationType } from '../types/database'

interface DayForm extends ProgramDayInput {
  id: string
}

function emptyDay(index: number): DayForm {
  return {
    id: crypto.randomUUID(),
    label: `Day ${String.fromCharCode(65 + index)}`,
    exercises: [],
  }
}

export function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { data: existingProgram } = useProgram(id)
  const { data: movements = [] } = useMovements()
  const { saveProgram } = useProgramMutations()

  const [name, setName] = useState('')
  const [rotationType, setRotationType] = useState<RotationType>('sequential')
  const [days, setDays] = useState<DayForm[]>([emptyDay(0)])
  const [activeDayId, setActiveDayId] = useState(days[0].id)

  useEffect(() => {
    if (existingProgram) {
      setName(existingProgram.name)
      setRotationType(existingProgram.rotation_type)
      const loaded = existingProgram.program_days.map((d) => ({
        id: d.id,
        label: d.label,
        exercises: d.program_day_exercises
          .sort((a, b) => a.exercise_order - b.exercise_order)
          .map((e) => ({
            movement_id: e.movement_id,
            target_sets: e.target_sets,
            target_reps: e.target_reps,
            target_rir: e.target_rir,
          })),
      }))
      setDays(loaded.length > 0 ? loaded : [emptyDay(0)])
      setActiveDayId(loaded[0]?.id ?? days[0].id)
    }
  }, [existingProgram])

  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0]

  const addDay = () => {
    const newDay = emptyDay(days.length)
    setDays([...days, newDay])
    setActiveDayId(newDay.id)
  }

  const removeDay = (dayId: string) => {
    if (days.length <= 1) return
    const filtered = days.filter((d) => d.id !== dayId)
    setDays(filtered)
    if (activeDayId === dayId) setActiveDayId(filtered[0].id)
  }

  const addExercise = (movementId: string) => {
    setDays(
      days.map((d) =>
        d.id === activeDayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                { movement_id: movementId, target_sets: 3, target_reps: 8, target_rir: 2 },
              ],
            }
          : d,
      ),
    )
  }

  const updateExercise = (
    index: number,
    field: 'target_sets' | 'target_reps' | 'target_rir',
    value: number,
  ) => {
    setDays(
      days.map((d) =>
        d.id === activeDayId
          ? {
              ...d,
              exercises: d.exercises.map((ex, i) =>
                i === index ? { ...ex, [field]: value } : ex,
              ),
            }
          : d,
      ),
    )
  }

  const removeExercise = (index: number) => {
    setDays(
      days.map((d) =>
        d.id === activeDayId
          ? { ...d, exercises: d.exercises.filter((_, i) => i !== index) }
          : d,
      ),
    )
  }

  const handleSave = async () => {
    if (!name.trim()) return
    await saveProgram.mutateAsync({
      id: isEdit ? id : undefined,
      name: name.trim(),
      rotation_type: rotationType,
      days: days.map(({ label, exercises }) => ({ label, exercises })),
    })
    navigate('/workout')
  }

  return (
    <PageShell title={isEdit ? 'Edit Program' : 'New Program'} showNav={false}>
      <div className="space-y-4">
        <Input label="Program Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Push Pull Legs" />

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Rotation</span>
          <select
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
            value={rotationType}
            onChange={(e) => setRotationType(e.target.value as RotationType)}
          >
            <option value="sequential">Sequential (Day A → B → C → repeat)</option>
            <option value="weekly">Weekly (fixed days per week)</option>
          </select>
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveDayId(day.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                day.id === activeDayId
                  ? 'text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
              style={day.id === activeDayId ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {day.label}
            </button>
          ))}
          <Button variant="secondary" onClick={addDay}>
            + Day
          </Button>
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <Input
              label="Day Label"
              value={activeDay.label}
              onChange={(e) =>
                setDays(days.map((d) => (d.id === activeDayId ? { ...d, label: e.target.value } : d)))
              }
            />
            {days.length > 1 && (
              <Button variant="ghost" onClick={() => removeDay(activeDayId)}>
                Remove
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {activeDay.exercises.map((ex, i) => {
              const movement = movements.find((m) => m.id === ex.movement_id)
              return (
                <div key={i} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{movement?.name ?? 'Exercise'}</span>
                    <button type="button" className="text-xs text-red-500" onClick={() => removeExercise(i)}>
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Sets"
                      type="number"
                      value={ex.target_sets}
                      onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value, 10) || 0)}
                    />
                    <Input
                      label="Reps"
                      type="number"
                      value={ex.target_reps}
                      onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value, 10) || 0)}
                    />
                    <Input
                      label="RIR"
                      type="number"
                      value={ex.target_rir}
                      onChange={(e) => updateExercise(i, 'target_rir', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-[var(--accent)]">Add Exercise</summary>
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {movements.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-[var(--bg-tertiary)]"
                  onClick={() => addExercise(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </details>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={saveProgram.isPending || !name.trim()}>
          {saveProgram.isPending ? 'Saving…' : 'Save Program'}
        </Button>
      </div>
    </PageShell>
  )
}
