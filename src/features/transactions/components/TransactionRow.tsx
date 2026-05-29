import { RefreshCw } from 'lucide-react'

import { getCategoryIcon } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>
type Category = Tables<'categories'>

type TransactionRowProps = {
  transaction: Transaction
  category?: Category
  onClick?: (transaction: Transaction) => void
}

export function TransactionRow({ transaction, category, onClick }: TransactionRowProps) {
  const Icon = getCategoryIcon(category?.icon ?? '')
  const isIncome = transaction.type === 'income'

  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]"
      onClick={() => onClick?.(transaction)}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: category ? `${category.color}20` : '#f5f5f5' }}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: category?.color ?? '#737373' }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{transaction.description}</p>
          {transaction.is_recurring && (
            <RefreshCw className="h-3 w-3 shrink-0 text-neutral-400" />
          )}
        </div>
        <p className="truncate text-xs text-neutral-400">
          {category?.name ?? 'Sans catégorie'}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            'text-sm font-semibold',
            isIncome ? 'text-emerald-600' : 'text-red-500',
          )}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-neutral-400">{formatDate(transaction.date, 'dd MMM')}</p>
      </div>
    </button>
  )
}
