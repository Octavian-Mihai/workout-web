import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { PageShell } from '../components/layout/PageShell'

export function LoginPage() {
  const { signIn, signUp, user, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password)
    setLoading(false)
    if (result.error) setError(result.error)
    else if (isSignUp) setError('Check your email to confirm signup, then sign in.')
  }

  return (
    <PageShell title="Sign In" showNav={false}>
      {!isConfigured && (
        <Card className="mb-4 border-yellow-500">
          <p className="text-sm">
            Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code> and add your keys.
            See <code>docs/ENVIRONMENT.md</code> for details.
          </p>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
        <button
          type="button"
          className="mt-3 w-full text-center text-xs text-[var(--text-secondary)]"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </Card>
    </PageShell>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth()

  if (loading) {
    return (
      <PageShell showNav={false}>
        <p className="text-center text-sm text-[var(--text-secondary)]">Loading…</p>
      </PageShell>
    )
  }

  if (!isConfigured) return <>{children}</>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
