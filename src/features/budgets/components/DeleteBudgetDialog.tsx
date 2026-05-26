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
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget'
import type { Tables } from '@/types/database'

type Budget = Tables<'budgets'>

type DeleteBudgetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget
  totalBudgetCount: number
}

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  budget,
  totalBudgetCount,
}: DeleteBudgetDialogProps) {
  const deleteBudget = useDeleteBudget()
  const isLast = totalBudgetCount <= 1

  async function handleDelete() {
    await deleteBudget.mutateAsync({ id: budget.id, totalCount: totalBudgetCount })
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les transactions, catégories, objectifs d'épargne
            et dettes liés à ce budget seront définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLast && (
          <p className="text-sm font-medium text-amber-600">
            Tu ne peux pas supprimer ton dernier budget.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLast || deleteBudget.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
