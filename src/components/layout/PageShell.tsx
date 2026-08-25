import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  title?: string
  showNav?: boolean
  action?: ReactNode
}

const HIDE_NAV_PATHS = ['/login', '/workout/active']

export function PageShell({ children, title, showNav, action }: PageShellProps) {
  const location = useLocation()
  const shouldShowNav =
    showNav ?? !HIDE_NAV_PATHS.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      {(title || action) && (
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {action}
          </div>
        </header>
      )}
      <main className="mx-auto max-w-lg px-4 py-4 pb-24">{children}</main>
      {shouldShowNav && <BottomNav />}
    </div>
  )
}
