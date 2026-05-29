import { endOfMonth, format, startOfMonth } from 'date-fns'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { AddCategoryDialog } from '@/features/categories/components/AddCategoryDialog'
import { CategoryCard, CategoryCardSkeleton } from '@/features/categories/components/CategoryCard'
import { EditCategoryDialog } from '@/features/categories/components/EditCategoryDialog'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

export default function BudgetPage() {
  const { activeBudgetId } = useActiveBudget()
  const { data: categories, isPending: catPending } = useCategories(activeBudgetId)
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  const { data: transactions } = useTransactions(activeBudgetId, { startDate, endDate })

  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [addOpen, setAddOpen] = useState(false)

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budget</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {fixed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Charges fixes
          </h2>
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
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            Enveloppes budget
          </h2>
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
