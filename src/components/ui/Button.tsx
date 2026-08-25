import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'text-white',
    secondary: 'border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)]',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  }

  const style =
    variant === 'primary'
      ? { backgroundColor: 'var(--accent)' }
      : undefined

  return (
    <button className={`${base} ${variants[variant]} ${className}`} style={style} {...props}>
      {children}
    </button>
  )
}
