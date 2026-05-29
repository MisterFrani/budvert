import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeftRight, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { TransactionRow } from '@/features/transactions/components/TransactionRow'
import { TransactionSheet } from '@/features/transactions/components/TransactionSheet'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>
type FilterType = 'all' | 'expense' | 'income' | 'recurring'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'expense', label: 'Dépenses' },
  { key: 'income', label: 'Revenus' },
  { key: 'recurring', label: 'Récurrentes' },
]

function groupByDay(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  transactions.forEach((t) => {
    const key = t.date.split('T')[0]
    const arr = map.get(key) ?? []
    arr.push(t)
    map.set(key, arr)
  })
  return map
}

function dayLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "Aujourd'hui"
  if (isYesterday(date)) return 'Hier'
  return format(date, 'd MMMM yyyy', { locale: fr })
}

export default function TransactionsPage() {
  const { activeBudgetId } = useActiveBudget()
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | undefined>()

  const apiFilter = filter !== 'all' ? { type: filter } : undefined
  const { data: transactions, isPending } = useTransactions(activeBudgetId, {
    ...apiFilter,
    limit: 50,
    offset: page * 50,
  })
  const { data: categories } = useCategories(activeBudgetId)

  const categoryMap = useMemo(() => {
    const map = new Map<string, Tables<'categories'>>()
    categories?.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const filtered = useMemo(() => {
    if (!transactions) return []
    if (!search) return transactions
    return transactions.filter((t) =>
      t.description.toLowerCase().includes(search.toLowerCase()),
    )
  }, [transactions, search])

  const grouped = useMemo(() => groupByDay(filtered), [filtered])
  const sortedDays = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a)),
    [grouped],
  )

  function openCreate() {
    setEditTarget(undefined)
    setSheetOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditTarget(t)
    setSheetOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-100 bg-white px-6 py-4 dark:border-[#262626] dark:bg-[#171717]">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0) }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === key
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isPending ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <ArrowLeftRight className="h-10 w-10 text-neutral-200" />
            <p className="text-sm text-neutral-400">Aucune transaction</p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              Ajouter ta première transaction
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sortedDays.map((day) => (
              <div key={day}>
                <p className="mb-1 px-3 text-xs font-medium text-neutral-400">{dayLabel(day)}</p>
                <div className="space-y-0.5">
                  {grouped.get(day)?.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      category={t.category_id ? categoryMap.get(t.category_id) : undefined}
                      onClick={openEdit}
                    />
                  ))}
                </div>
              </div>
            ))}

            {transactions && transactions.length === 50 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Charger plus
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <button
        onClick={openCreate}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#6366f1] shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={(o) => { setSheetOpen(o); if (!o) setEditTarget(undefined) }}
        transaction={editTarget}
      />
    </div>
  )
}
