import type { ReactNode } from 'react'

type AuthCardProps = {
  subtitle: string
  children: ReactNode
}

export function AuthCard({ subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">budvert</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
