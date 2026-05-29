import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { TransactionRow } from '@/features/transactions/components/TransactionRow'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>
type Category = Tables<'categories'>

type Props = {
  transactions: Transaction[] | undefined
  categories: Category[] | undefined
  isLoading: boolean
}

export function RecentTransactions({ transactions, categories, isLoading }: Props) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories?.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const recent = transactions?.slice(0, 5) ?? []

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-[#262626] dark:bg-[#171717]">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-[#262626]">
        <p className="text-sm font-medium">Dernières transactions</p>
        <Link to="/transactions" className="text-xs text-[#6366f1] hover:underline">
          Voir tout
        </Link>
      </div>

      <div className="p-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">Aucune transaction ce mois</p>
        ) : (
          recent.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              category={t.category_id ? categoryMap.get(t.category_id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
