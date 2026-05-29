import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateBudgetDialog } from '@/features/budgets/components/CreateBudgetDialog'
import { DeleteBudgetDialog } from '@/features/budgets/components/DeleteBudgetDialog'
import { EditBudgetDialog } from '@/features/budgets/components/EditBudgetDialog'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useUserBudgets } from '@/features/budgets/hooks/useUserBudgets'
import { AddCategoryDialog } from '@/features/categories/components/AddCategoryDialog'
import { EditCategoryDialog } from '@/features/categories/components/EditCategoryDialog'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { getCategoryIcon } from '@/lib/constants'
import type { Tables } from '@/types/database'

type Budget = Tables<'budgets'>
type Category = Tables<'categories'>

const BUDGET_TYPE_LABELS: Record<string, string> = {
  personal: 'Personnel',
  couple: 'Couple',
  colocation: 'Colocation',
  project: 'Projet',
}

function ComingSoonTab() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-neutral-400">Bientôt disponible</p>
    </div>
  )
}

export default function SettingsPage() {
  const { data: budgets } = useUserBudgets()
  const { activeBudgetId } = useActiveBudget()
  const { data: categories } = useCategories(activeBudgetId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Budget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [editCatTarget, setEditCatTarget] = useState<Category | null>(null)

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Paramètres</h1>

      <Tabs defaultValue="budgets">
        <TabsList className="mb-6">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="theme">Thème</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <ComingSoonTab />
        </TabsContent>

        <TabsContent value="budgets">
          <div className="max-w-xl space-y-4">
            <h2 className="text-lg font-medium">Tes budgets</h2>
            <div className="space-y-2">
              {budgets?.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-[#262626] dark:bg-[#171717]"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: budget.color }} />
                  <div className="flex flex-1 items-center gap-2 overflow-hidden">
                    <span className="truncate text-sm font-medium">{budget.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {BUDGET_TYPE_LABELS[budget.type] ?? budget.type}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditTarget(budget)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteTarget(budget)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau budget
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="charges">
          <div className="max-w-xl space-y-4">
            <h2 className="text-lg font-medium">Catégories du budget actif</h2>
            <div className="space-y-2">
              {categories?.map((cat) => {
                const Icon = getCategoryIcon(cat.icon)
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-[#262626] dark:bg-[#171717]"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <span className="truncate text-sm font-medium">{cat.name}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {cat.type === 'fixed' ? 'Fixe' : 'Enveloppe'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0"
                      onClick={() => setEditCatTarget(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
              {categories?.length === 0 && (
                <p className="text-sm text-neutral-400">Aucune catégorie</p>
              )}
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setAddCatOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="theme">
          <ComingSoonTab />
        </TabsContent>
      </Tabs>

      <CreateBudgetDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <EditBudgetDialog
          open={!!editTarget}
          onOpenChange={(o) => { if (!o) setEditTarget(null) }}
          budget={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteBudgetDialog
          open={!!deleteTarget}
          onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
          budget={deleteTarget}
          totalBudgetCount={budgets?.length ?? 1}
        />
      )}

      {activeBudgetId && (
        <AddCategoryDialog
          open={addCatOpen}
          onOpenChange={setAddCatOpen}
          budgetId={activeBudgetId}
        />
      )}

      {editCatTarget && activeBudgetId && (
        <EditCategoryDialog
          open={!!editCatTarget}
          onOpenChange={(o) => { if (!o) setEditCatTarget(null) }}
          category={editCatTarget}
          budgetId={activeBudgetId}
        />
      )}
    </div>
  )
}
