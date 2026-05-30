import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowDownToLine, CreditCard, PiggyBank } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OverdraftMeter } from '@/features/dashboard/components/OverdraftMeter'
import type { BudgetSummary } from '@/features/dashboard/hooks/useBudgetSummary'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = {
  firstName: string
  displayMonth: Date
  summary: BudgetSummary | undefined
  isLoading: boolean
}

export function HeroCard({ firstName, displayMonth, summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-neutral-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-[#262626] dark:from-[#1a1a2e] dark:to-[#171717]">
        <div>
          <Skeleton className="mb-1 h-6 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="mb-1 h-4 w-28" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  const available = summary?.available ?? 0
  const carriedOver = summary?.carriedOver ?? 0
  const monthIncome = summary?.monthIncome ?? 0
  const monthExpenses = summary?.monthExpenses ?? 0
  const savedThisMonth = summary?.savedThisMonth ?? 0
  const debtRemaining = summary?.debtRemaining ?? 0
  const debtDueThisMonth = summary?.debtDueThisMonth ?? 0
  const debtPaidThisMonth = summary?.debtPaidThisMonth ?? 0
  const reallyFree = summary?.reallyFree ?? 0
  const overdraftLimit = summary?.overdraftLimit ?? 0
  const overdraftUsed = summary?.overdraftUsed ?? 0
  const balanceZone = summary?.balanceZone ?? 'positive'
  const isFreePositive = reallyFree >= 0

  const balanceColor =
    balanceZone === 'positive'
      ? 'text-emerald-600'
      : balanceZone === 'overdraft'
        ? 'text-amber-600'
        : 'text-red-600'

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-[#262626] dark:from-[#1a1a2e] dark:to-[#171717]">
      {/* Header */}
      <div>
        <p className="text-lg font-semibold">Bonjour {firstName}</p>
        <p className="text-sm capitalize text-neutral-400">
          {format(displayMonth, 'MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Solde disponible */}
      <div>
        <p className="mb-0.5 text-xs text-neutral-500">Solde disponible</p>
        <p className={cn('text-4xl font-bold', balanceColor)}>
          {formatCurrency(available)}
        </p>

        {balanceZone !== 'positive' && (
          <div className="mt-3">
            <OverdraftMeter
              available={available}
              overdraftLimit={overdraftLimit}
              overdraftUsed={overdraftUsed}
              balanceZone={balanceZone}
            />
          </div>
        )}
      </div>

      {/* Détail inline */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <ArrowDownToLine className={cn('h-3 w-3', carriedOver >= 0 ? 'text-neutral-400' : 'text-red-400')} />
          <span className={carriedOver < 0 ? 'text-red-500' : ''}>
            Reporté : {carriedOver >= 0 ? '+' : ''}{formatCurrency(carriedOver)}
          </span>
        </span>
        <span className="text-neutral-200 dark:text-neutral-700">·</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Revenus : +{formatCurrency(monthIncome)}
        </span>
        <span className="text-neutral-200 dark:text-neutral-700">·</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Dépenses : -{formatCurrency(monthExpenses)}
        </span>
      </div>

      <Separator />

      {/* Engagements */}
      <div className="rounded-xl bg-neutral-50 p-4 dark:bg-[#1a1a1a]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Engagements ce mois
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <PiggyBank className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Épargné</p>
              <p className="text-sm font-semibold">{formatCurrency(savedThisMonth)}</p>
              <p className="text-[10px] text-neutral-400">ce mois</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <CreditCard className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Dettes</p>
              <p className="text-sm font-semibold">{formatCurrency(debtRemaining)}</p>
              <p className="text-[10px] text-neutral-400">
                {formatCurrency(debtPaidThisMonth)} payé / {formatCurrency(debtDueThisMonth)} dû
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Reste vraiment libre</p>
            <p className="text-[10px] text-neutral-400">après épargne et dettes du mois</p>
          </div>
          <p className={cn('text-xl font-bold', isFreePositive ? 'text-[#6366f1]' : 'text-red-500')}>
            {formatCurrency(reallyFree)}
          </p>
        </div>
      </div>
    </div>
  )
}
