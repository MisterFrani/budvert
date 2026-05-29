import { differenceInCalendarMonths, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, MoreHorizontal, PiggyBank, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { ContributionDialog } from '@/features/savings/components/ContributionDialog'
import { SavingsGoalDialog } from '@/features/savings/components/SavingsGoalDialog'
import { useDeleteSavingsGoal } from '@/features/savings/hooks/useDeleteSavingsGoal'
import { useSavingsGoals } from '@/features/savings/hooks/useSavingsGoals'
import { getCategoryIcon } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type SavingsGoal = Tables<'savings_goals'>

export default function SavingsPage() {
  const { activeBudgetId } = useActiveBudget()
  const { data: goals, isPending } = useSavingsGoals(activeBudgetId)
  const deleteGoal = useDeleteSavingsGoal()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SavingsGoal | null>(null)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null)

  if (isPending) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Épargne</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Button>
      </div>

      {goals?.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
          <PiggyBank className="h-12 w-12 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Aucun objectif d&apos;épargne
          </p>
          <p className="text-xs text-neutral-400">
            Crée ton premier objectif pour suivre ta progression
          </p>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            Créer un objectif
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals?.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditTarget}
              onContribute={setContributeTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {activeBudgetId && (
        <>
          <SavingsGoalDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            budgetId={activeBudgetId}
          />
          {editTarget && (
            <SavingsGoalDialog
              open={!!editTarget}
              onOpenChange={(o) => { if (!o) setEditTarget(null) }}
              budgetId={activeBudgetId}
              goal={editTarget}
            />
          )}
          {contributeTarget && (
            <ContributionDialog
              open={!!contributeTarget}
              onOpenChange={(o) => { if (!o) setContributeTarget(null) }}
              budgetId={activeBudgetId}
              goal={contributeTarget}
            />
          )}
        </>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet objectif ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;objectif &quot;{deleteTarget?.name}&quot; et
              toutes ses contributions seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteTarget && activeBudgetId) {
                  deleteGoal.mutate({ id: deleteTarget.id, budgetId: activeBudgetId })
                  setDeleteTarget(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type GoalCardProps = {
  goal: SavingsGoal
  onEdit: (goal: SavingsGoal) => void
  onContribute: (goal: SavingsGoal) => void
  onDelete: (goal: SavingsGoal) => void
}

function GoalCard({ goal, onEdit, onContribute, onDelete }: GoalCardProps) {
  const current = goal.current_amount ?? 0
  const pct = goal.target_amount > 0 ? Math.min((current / goal.target_amount) * 100, 100) : 0
  const achieved = current >= goal.target_amount
  const Icon = getCategoryIcon(goal.icon ?? 'piggy-bank')

  const monthlySuggestion = (() => {
    if (!goal.target_date || achieved) return null
    const months = differenceInCalendarMonths(parseISO(goal.target_date), new Date())
    if (months <= 0) return null
    return (goal.target_amount - current) / months
  })()

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold">{goal.name}</p>
            {achieved && (
              <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                Atteint
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(goal)}>Modifier</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(goal)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(current)}</p>
      <p className="mb-3 text-sm text-neutral-500">sur {formatCurrency(goal.target_amount)} objectif</p>

      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              achieved ? 'bg-green-500' : 'bg-indigo-500',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-neutral-500">{Math.round(pct)}%</span>
      </div>

      {goal.target_date && (
        <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
          <Calendar className="h-3 w-3" />
          <span>Objectif : {format(parseISO(goal.target_date), 'd MMMM yyyy', { locale: fr })}</span>
        </div>
      )}

      {monthlySuggestion !== null && (
        <p className="mt-1 text-xs text-neutral-400">
          → {formatCurrency(monthlySuggestion)} / mois pendant{' '}
          {differenceInCalendarMonths(parseISO(goal.target_date!), new Date())} mois
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full gap-1.5"
        onClick={() => onContribute(goal)}
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter des fonds
      </Button>
    </div>
  )
}
