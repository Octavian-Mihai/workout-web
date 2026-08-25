import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 ${onClick ? 'cursor-pointer active:opacity-80' : ''} ${className}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
