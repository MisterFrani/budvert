import { format, isSameMonth, isSameYear, parseISO, startOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatCurrency } from '@/lib/format'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>

type Props = { transactions: Transaction[] | undefined }

function RoundedBar(props: Record<string, unknown>) {
  const { x, y, width, height, fill } = props as { x: number; y: number; width: number; height: number; fill: string }
  if (!height || height <= 0) return null
  const r = Math.min(3, (width as number) / 2)
  return (
    <path
      d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
      fill={fill}
    />
  )
}

export function BarChartWidget({ transactions }: Props) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) =>
      startOfMonth(subMonths(new Date(), 5 - i)),
    )
    return months.map((month) => {
      const monthTx = transactions?.filter((t) => {
        const d = parseISO(t.date)
        return isSameMonth(d, month) && isSameYear(d, month)
      }) ?? []
      return {
        month: format(month, 'MMM', { locale: fr }),
        Dépenses: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        Revenus: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      }
    })
  }, [transactions])

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
      <p className="mb-4 text-sm font-medium">6 derniers mois</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#a3a3a3' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
          />
          <Bar dataKey="Dépenses" fill="#ef4444" shape={<RoundedBar />} />
          <Bar dataKey="Revenus" fill="#10b981" shape={<RoundedBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
