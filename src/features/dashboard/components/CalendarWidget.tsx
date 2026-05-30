import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'

import { TransactionRow } from '@/features/transactions/components/TransactionRow'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>
type Category = Tables<'categories'>

type Props = {
  transactions: Transaction[] | undefined
  categories: Category[] | undefined
  month: Date
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function CalendarWidget({ transactions, categories, month }: Props) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    setSelectedDay(null)
  }, [month])

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories?.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const dailyMap = useMemo(() => {
    const map = new Map<string, { net: number; transactions: Transaction[] }>()
    transactions?.forEach((t) => {
      const key = t.date.split('T')[0]
      const existing = map.get(key) ?? { net: 0, transactions: [] }
      const delta = t.type === 'income' ? t.amount : -t.amount
      map.set(key, { net: existing.net + delta, transactions: [...existing.transactions, t] })
    })
    return map
  }, [transactions])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  const selectedDayTransactions = selectedDay ? dailyMap.get(selectedDay)?.transactions ?? [] : []

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-[#262626] dark:bg-[#171717]">
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-[#262626]">
        <p className="text-sm font-medium capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </p>
      </div>

      <div className="p-4">
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <p key={d} className="text-[10px] font-medium text-neutral-400">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const daily = dailyMap.get(key)
            const inMonth = isSameMonth(day, month)
            const isSelected = selectedDay === key
            const today = isToday(day)

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : key)}
                disabled={!daily}
                className={cn(
                  'flex flex-col items-center rounded-lg px-1 py-1.5 text-xs transition-colors',
                  !inMonth && 'opacity-30',
                  daily && inMonth && (daily.net >= 0 ? 'bg-green-50' : 'bg-red-50'),
                  isSelected && 'ring-2 ring-[#6366f1]',
                  daily && 'cursor-pointer hover:opacity-80',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    today && 'bg-[#6366f1] text-white',
                    !today && !inMonth && 'text-neutral-300',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {daily && inMonth && (
                  <span
                    className={cn(
                      'mt-0.5 text-[9px] font-medium leading-none',
                      daily.net >= 0 ? 'text-emerald-600' : 'text-red-500',
                    )}
                  >
                    {daily.net >= 0 ? '+' : ''}{formatCurrency(daily.net).replace('€', '').trim()}€
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay && selectedDayTransactions.length > 0 && (
        <div className="border-t border-neutral-100 px-2 pb-3 dark:border-[#262626]">
          <p className="mb-1 px-3 pt-3 text-xs font-medium text-neutral-400">
            {format(parseISO(selectedDay), 'd MMMM', { locale: fr })}
          </p>
          {selectedDayTransactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              category={t.category_id ? categoryMap.get(t.category_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
