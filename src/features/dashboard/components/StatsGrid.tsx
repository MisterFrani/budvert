import { ArrowLeftRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import type { Tables } from '@/types/database'

type Props = {
  totalExpenses: number
  totalIncome: number
  transactions: Tables<'transactions'>[] | undefined
  categories: Tables<'categories'>[] | undefined
  monthlyIncome: number
  isLoading: boolean
}

export function StatsGrid({ totalExpenses, totalIncome, transactions, categories, monthlyIncome, isLoading }: Props) {
  const budgetRemaining =
    categories
      ?.filter((c) => c.type === 'budget')
      .reduce((sum, c) => sum + c.amount, 0) ?? 0

  const stats = [
    {
      label: 'Dépenses du mois',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/10',
    },
    {
      label: 'Revenus du mois',
      value: formatCurrency(monthlyIncome + totalIncome),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    },
    {
      label: 'Budget enveloppes',
      value: formatCurrency(budgetRemaining),
      icon: Wallet,
      color: 'text-[#6366f1]',
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
    },
    {
      label: 'Transactions',
      value: String(transactions?.length ?? 0),
      icon: ArrowLeftRight,
      color: 'text-neutral-600',
      bg: 'bg-neutral-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <Skeleton className="mb-3 h-8 w-8 rounded-lg" />
            <Skeleton className="mb-1.5 h-6 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-xs text-neutral-400">{label}</p>
        </div>
      ))}
    </div>
  )
}
