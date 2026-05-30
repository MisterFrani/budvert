import { endOfMonth, format, startOfMonth } from 'date-fns'
import { AlertTriangle, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { renameLegacyCategories } from '@/features/categories/api'
import { AddCategoryDialog } from '@/features/categories/components/AddCategoryDialog'
import { CategoryCard, CategoryCardSkeleton } from '@/features/categories/components/CategoryCard'
import { EditCategoryDialog } from '@/features/categories/components/EditCategoryDialog'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { formatCurrency } from '@/lib/format'
import { getProgressColor } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

export default function BudgetPage() {
  const { activeBudgetId } = useActiveBudget()
  const { data: categories, isPending: catPending } = useCategories(activeBudgetId)
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  const { data: transactions } = useTransactions(activeBudgetId, { startDate, endDate, limit: 500 })

  const queryClient = useQueryClient()
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const hasLegacyNames = !bannerDismissed && (
    categories?.some((c) => c.name === 'Alimentation' || c.name === 'Loisirs') ?? false
  )

  async function handleRenameDefaults() {
    if (!activeBudgetId) return
    await renameLegacyCategories(activeBudgetId)
    queryClient.invalidateQueries({ queryKey: ['categories', activeBudgetId] })
    setBannerDismissed(true)
  }

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>()
    transactions?.forEach((t) => {
      if (t.type === 'expense' && t.category_id) {
        map.set(t.category_id, (map.get(t.category_id) ?? 0) + t.amount)
      }
    })
    return map
  }, [transactions])

  const fixed = categories?.filter((c) => c.type === 'fixed') ?? []
  const envelopes = categories?.filter((c) => c.type === 'budget') ?? []

  const fixedPlanned = fixed.reduce((s, c) => s + c.amount, 0)
  const fixedSpent = fixed.reduce((s, c) => s + (spentByCategory.get(c.id) ?? 0), 0)
  const envelopesPlanned = envelopes.reduce((s, c) => s + c.amount, 0)
  const envelopesSpent = envelopes.reduce((s, c) => s + (spentByCategory.get(c.id) ?? 0), 0)
  const totalPlanned = fixedPlanned + envelopesPlanned
  const totalSpent = fixedSpent + envelopesSpent
  const totalRatio = totalPlanned > 0 ? totalSpent / totalPlanned : 0

  if (catPending) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 7 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {hasLegacyNames && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="flex-1 text-sm text-amber-700 dark:text-amber-400">
            Tes catégories utilisent les anciens noms.
            <button type="button" className="ml-1 underline" onClick={handleRenameDefaults}>
              Mettre à jour vers les nouveaux noms
            </button>
          </span>
          <button type="button" aria-label="Fermer" onClick={() => setBannerDismissed(true)}>
            <X className="h-3.5 w-3.5 text-amber-400" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budget</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Récap globale */}
      {categories && categories.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Récap du mois
          </p>
          <div className="mb-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold">{formatCurrency(totalPlanned)}</p>
              <p className="text-xs text-neutral-400">Prévu</p>
            </div>
            <div>
              <p className={cn('text-lg font-semibold', totalRatio > 0.9 ? 'text-red-500' : totalRatio > 0.7 ? 'text-amber-500' : 'text-neutral-900 dark:text-white')}>
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-neutral-400">Dépensé</p>
            </div>
            <div>
              <p className={cn('text-lg font-semibold', totalSpent > totalPlanned ? 'text-red-500' : 'text-emerald-600')}>
                {formatCurrency(totalPlanned - totalSpent)}
              </p>
              <p className="text-xs text-neutral-400">Reste</p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(totalRatio * 100, 100)}%`,
                backgroundColor: getProgressColor(totalRatio * 100),
              }}
            />
          </div>
        </div>
      )}

      {fixed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Charges fixes
            </h2>
            <GroupTotals spent={fixedSpent} planned={fixedPlanned} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fixed.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={spentByCategory.get(cat.id) ?? 0}
                onEdit={setEditTarget}
              />
            ))}
          </div>
        </section>
      )}

      {envelopes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Enveloppes budget
            </h2>
            <GroupTotals spent={envelopesSpent} planned={envelopesPlanned} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {envelopes.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={spentByCategory.get(cat.id) ?? 0}
                onEdit={setEditTarget}
              />
            ))}
          </div>
        </section>
      )}

      {categories?.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-neutral-400">Aucune catégorie</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            Créer une catégorie
          </Button>
        </div>
      )}

      <AddCategoryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        budgetId={activeBudgetId ?? ''}
      />

      {editTarget && activeBudgetId && (
        <EditCategoryDialog
          open={!!editTarget}
          onOpenChange={(o) => { if (!o) setEditTarget(null) }}
          category={editTarget}
          budgetId={activeBudgetId}
        />
      )}
    </div>
  )
}

function GroupTotals({ spent, planned }: { spent: number; planned: number }) {
  const ratio = planned > 0 ? spent / planned : 0
  const color =
    ratio > 0.9
      ? 'text-red-500'
      : ratio > 0.7
        ? 'text-amber-500'
        : 'text-emerald-600'

  return (
    <p className="text-sm font-medium">
      <span className={color}>{formatCurrency(spent)}</span>
      <span className="text-neutral-400"> / {formatCurrency(planned)}</span>
    </p>
  )
}
