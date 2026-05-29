import { Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategoryIcon, getProgressColor } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

type CategoryCardProps = {
  category: Category
  spent: number
  onEdit: (category: Category) => void
}

export function CategoryCard({ category, spent, onEdit }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.icon)
  const percentage = category.amount > 0 ? Math.min((spent / category.amount) * 100, 100) : 0
  const overBudget = spent > category.amount && category.amount > 0
  const remaining = category.amount - spent
  const color = getProgressColor(percentage)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: category.color }} />
          </div>
          <div>
            <p className="text-sm font-medium">{category.name}</p>
            <Badge
              variant="secondary"
              className="mt-0.5 h-4 px-1.5 text-[10px]"
            >
              {category.type === 'fixed' ? 'Fixe' : 'Enveloppe'}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 text-neutral-400 hover:text-neutral-600"
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{formatCurrency(spent)} dépensés</span>
          <span>{formatCurrency(category.amount)} prévus</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>

        <p className={cn('text-xs font-medium', overBudget ? 'text-red-500' : 'text-neutral-400')}>
          {overBudget
            ? `${formatCurrency(Math.abs(remaining))} dépassé`
            : `${formatCurrency(remaining)} restants`}
        </p>
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}
