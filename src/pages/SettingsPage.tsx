import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { PageShell } from '../components/layout/PageShell'
import { useTheme } from '../context/ThemeProvider'
import { useBodyWeightLogs, useBodyWeightMutations } from '../hooks/useWorkouts'
import type { ThemeMode } from '../types/database'

const ACCENT_PRESETS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#06b6d4']

export function SettingsPage() {
  const { accentColor, themeMode, setAccentColor, setThemeMode } = useTheme()
  const { data: weightLogs = [] } = useBodyWeightLogs()
  const { logWeight } = useBodyWeightMutations()

  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [customAccent, setCustomAccent] = useState(accentColor)

  const handleLogWeight = async () => {
    const w = parseFloat(weight)
    if (w <= 0) return
    await logWeight.mutateAsync({ weight_kg: w, logged_on: date })
    setWeight('')
  }

  return (
    <PageShell title="Settings">
      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Appearance</h2>

          <p className="mb-2 text-xs text-[var(--text-secondary)]">Background</p>
          <div className="mb-4 flex gap-2">
            {(['light', 'dark'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                className={`flex-1 rounded-lg py-2 text-sm capitalize ${
                  themeMode === mode
                    ? 'font-semibold text-white'
                    : 'border border-[var(--border)] bg-[var(--bg-primary)]'
                }`}
                style={themeMode === mode ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {mode}
              </button>
            ))}
          </div>

          <p className="mb-2 text-xs text-[var(--text-secondary)]">Accent Color</p>
          <div className="mb-3 flex gap-2">
            {ACCENT_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAccentColor(color)}
                className="h-8 w-8 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: accentColor === color ? 'var(--text-primary)' : 'transparent',
                }}
                aria-label={`Accent ${color}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="color"
              value={customAccent}
              onChange={(e) => setCustomAccent(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border)]"
            />
            <Button variant="secondary" onClick={() => setAccentColor(customAccent)}>
              Apply Custom
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold">Body Weight</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Input
              label="Weight (kg)"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.0"
            />
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleLogWeight} disabled={logWeight.isPending}>
            Log Weight
          </Button>

          {weightLogs.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-[var(--text-secondary)]">History</p>
              <div className="flex items-end gap-1" style={{ height: 60 }}>
                {weightLogs.slice(-14).map((log) => {
                  const min = Math.min(...weightLogs.map((l) => l.weight_kg))
                  const max = Math.max(...weightLogs.map((l) => l.weight_kg))
                  const range = max - min || 1
                  return (
                    <div
                      key={log.id}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${((log.weight_kg - min) / range) * 50 + 10}px`,
                        backgroundColor: 'var(--accent)',
                      }}
                      title={`${log.logged_on}: ${log.weight_kg}kg`}
                    />
                  )
                })}
              </div>
              <div className="mt-2 space-y-1">
                {weightLogs
                  .slice(-5)
                  .reverse()
                  .map((log) => (
                    <div key={log.id} className="flex justify-between text-xs">
                      <span>{log.logged_on}</span>
                      <span className="font-medium">{log.weight_kg} kg</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
