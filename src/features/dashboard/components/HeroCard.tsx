import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Props = {
  budget: Tables<'budgets'> | undefined
  profile: { full_name: string | null } | undefined
  totalExpenses: number
  totalIncome: number
  isLoading: boolean
}

export function HeroCard({ budget, profile, totalExpenses, totalIncome, isLoading }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi'
  const available = (budget?.monthly_income ?? 0) + totalIncome - totalExpenses
  const isPositive = available >= 0

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-[#262626] dark:from-[#1a1a2e] dark:to-[#171717]">
        <Skeleton className="mb-2 h-6 w-40" />
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-3 h-12 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-[#262626] dark:from-[#1a1a2e] dark:to-[#171717]">
      <p className="text-lg font-semibold">Bonjour {firstName} 👋</p>
      <p className="mb-4 text-sm text-neutral-400 capitalize">
        {format(new Date(), 'MMMM yyyy', { locale: fr })}
      </p>

      <div className="mb-1">
        <p className="text-xs text-neutral-500">Disponible ce mois</p>
        <p className={cn('text-4xl font-bold', isPositive ? 'text-neutral-900 dark:text-white' : 'text-red-500')}>
          {formatCurrency(available)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Revenus : {formatCurrency((budget?.monthly_income ?? 0) + totalIncome)}
        </span>
        <span className="flex items-center gap-1 text-red-500">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Dépenses : {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  )
}
