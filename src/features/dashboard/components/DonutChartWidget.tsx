import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { getCategoryIcon } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>
type Category = Tables<'categories'>

type Props = {
  transactions: Transaction[] | undefined
  categories: Category[] | undefined
}

export function DonutChartWidget({ transactions, categories }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, { name: string; color: string; icon: string; value: number }>()
    categories?.forEach((cat) => {
      const spent = transactions
        ?.filter((t) => t.type === 'expense' && t.category_id === cat.id)
        .reduce((s, t) => s + t.amount, 0) ?? 0
      if (spent > 0) {
        map.set(cat.id, { name: cat.name, color: cat.color, icon: cat.icon, value: spent })
      }
    })
    return Array.from(map.values())
  }, [transactions, categories])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
        <p className="text-sm text-neutral-400">Aucune dépense ce mois</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
      <p className="mb-4 text-sm font-medium">Répartition</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _: string, props: { payload?: { name: string } }) => [
                  `${formatCurrency(value)} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                  props.payload?.name ?? '',
                ]}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-lg font-bold">{data.length}</p>
            <p className="text-[10px] text-neutral-400">catégories</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {data.slice(0, 5).map((entry) => {
            const Icon = getCategoryIcon(entry.icon)
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${entry.color}20` }}
                >
                  <Icon className="h-3 w-3" style={{ color: entry.color }} />
                </div>
                <span className="flex-1 truncate text-xs text-neutral-600">{entry.name}</span>
                <span className="text-xs font-medium">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
