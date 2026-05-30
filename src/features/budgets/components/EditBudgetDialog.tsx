import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BudgetFormFields } from '@/features/budgets/components/BudgetForm'
import { useUpdateBudget } from '@/features/budgets/hooks/useUpdateBudget'
import { type CreateBudgetData,createBudgetSchema } from '@/features/budgets/schemas'
import type { Tables } from '@/types/database'

type Budget = Tables<'budgets'>

type EditBudgetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget
}

export function EditBudgetDialog({ open, onOpenChange, budget }: EditBudgetDialogProps) {
  const updateBudget = useUpdateBudget()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: budget.name,
      type: budget.type as CreateBudgetData['type'],
      color: budget.color,
      overdraft_limit: budget.overdraft_limit ?? 0,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: budget.name,
        type: budget.type as CreateBudgetData['type'],
        color: budget.color,
        overdraft_limit: budget.overdraft_limit ?? 0,
      })
    }
  }, [open, budget, reset])

  async function onSubmit(data: CreateBudgetData) {
    await updateBudget.mutateAsync({ id: budget.id, updates: data })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le budget</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <BudgetFormFields register={register} watch={watch} setValue={setValue} errors={errors} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || updateBudget.isPending}>
              {(isSubmitting || updateBudget.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
