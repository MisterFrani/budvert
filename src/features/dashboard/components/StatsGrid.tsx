import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CreditCard, Percent, PiggyBank, TrendingDown } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { BudgetSummary } from '@/features/dashboard/hooks/useBudgetSummary'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Props = {
  summary: BudgetSummary | undefined
  prevSummary: BudgetSummary | undefined
  savingsGoals: Tables<'savings_goals'>[] | undefined
  debts: Tables<'debts'>[] | undefined
  displayMonth: Date
  isLoading: boolean
}

export function StatsGrid({ summary, prevSummary, savingsGoals, debts, displayMonth, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
            <Skeleton className="mb-3 h-8 w-8 rounded-lg" />
            <Skeleton className="mb-1.5 h-6 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>
    )
  }

  const monthExpenses = summary?.monthExpenses ?? 0
  const prevExpenses = prevSummary?.monthExpenses ?? 0
  const savedThisMonth = summary?.savedThisMonth ?? 0
  const monthIncome = summary?.monthIncome ?? 0

  const prevMonthName = format(
    new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1),
    'MMM',
    { locale: fr },
  )

  const expenseDelta =
    prevExpenses > 0
      ? Math.round(((monthExpenses - prevExpenses) / prevExpenses) * 100)
      : null

  const totalSavings =
    savingsGoals?.reduce((s, g) => s + (g.current_amount ?? 0), 0) ?? 0

  const totalDebtRemaining =
    debts?.reduce((s, d) => s + Math.max(0, d.total_amount - (d.paid_amount ?? 0)), 0) ?? 0

  const savingsRate =
    monthIncome > 0 ? Math.round((savedThisMonth / monthIncome) * 100) : null

  const stats = [
    {
      label: 'Dépenses du mois',
      value: formatCurrency(monthExpenses),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/10',
      sub:
        expenseDelta !== null ? (
          <span className={cn('text-xs font-medium', expenseDelta > 0 ? 'text-red-500' : 'text-emerald-600')}>
            {expenseDelta > 0 ? '+' : ''}{expenseDelta}% vs {prevMonthName}
          </span>
        ) : (
          <span className="text-xs text-neutral-400">vs {prevMonthName}</span>
        ),
    },
    {
      label: 'Épargne totale',
      value: formatCurrency(totalSavings),
      icon: PiggyBank,
      color: 'text-[#6366f1]',
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      sub: (
        <span className="text-xs text-neutral-400">
          +{formatCurrency(savedThisMonth)} ce mois
        </span>
      ),
    },
    {
      label: 'Dettes restantes',
      value: formatCurrency(totalDebtRemaining),
      icon: CreditCard,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      sub: (
        <span className="text-xs text-neutral-400">
          {debts?.filter((d) => (d.paid_amount ?? 0) < d.total_amount).length ?? 0} active(s)
        </span>
      ),
    },
    {
      label: 'Taux d\'épargne',
      value: savingsRate !== null ? `${savingsRate}%` : '—',
      icon: Percent,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      sub: (
        <span className="text-xs text-neutral-400">
          sur revenus du mois
        </span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
        <div
          key={label}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-xl font-semibold">{value}</p>
          <p className="mb-0.5 text-xs text-neutral-400">{label}</p>
          {sub}
        </div>
      ))}
    </div>
  )
}
