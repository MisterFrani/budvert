import { CreditCard, PiggyBank, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { BrandIcon } from '@/components/shared/BrandIcon'
import { getCategoryIcon } from '@/lib/constants'
import { matchBrand } from '@/lib/brand-icons'
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
  const hasBrand = matchBrand(transaction.description) !== null
  const isSavingsLinked = !!transaction.savings_contribution_id
  const isDebtLinked = !!transaction.debt_payment_id
  const isLinked = isSavingsLinked || isDebtLinked

  function handleClick() {
    if (!onClick) return
    if (isLinked) {
      if (isSavingsLinked) {
        toast.info('Transaction liée à un objectif d\'épargne. Modifie-la depuis la page Épargne.')
      } else {
        toast.info('Transaction liée à une dette. Gère-la depuis la page Dettes.')
      }
      return
    }
    onClick(transaction)
  }

  const iconEl = (() => {
    if (isSavingsLinked) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
          <PiggyBank className="h-4 w-4 text-indigo-600" />
        </div>
      )
    }
    if (isDebtLinked) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
          <CreditCard className="h-4 w-4 text-amber-600" />
        </div>
      )
    }
    if (hasBrand) {
      return <BrandIcon name={transaction.description} size={18} />
    }
    return (
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: category ? `${category.color}20` : '#f5f5f5' }}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: category?.color ?? '#737373' }}
        />
      </div>
    )
  })()

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]"
      onClick={handleClick}
    >
      {iconEl}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{transaction.description}</p>
          {transaction.is_recurring && !isLinked && (
            <RefreshCw className="h-3 w-3 shrink-0 text-neutral-400" />
          )}
          {isSavingsLinked && (
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
              Épargne
            </span>
          )}
          {isDebtLinked && (
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-600 dark:bg-amber-900/20">
              Dette
            </span>
          )}
        </div>
        <p className="truncate text-xs text-neutral-400">
          {isLinked ? '—' : (category?.name ?? 'Sans catégorie')}
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
