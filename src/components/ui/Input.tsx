import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      )}
      <input
        className={`w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] ${className}`}
        {...props}
      />
    </label>
  )
}
