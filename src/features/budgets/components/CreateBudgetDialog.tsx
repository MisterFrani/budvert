import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BudgetFormFields } from '@/features/budgets/components/BudgetForm'
import { useCreateBudget } from '@/features/budgets/hooks/useCreateBudget'
import { type CreateBudgetData,createBudgetSchema } from '@/features/budgets/schemas'
import { BUDGET_COLORS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

type CreateBudgetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBudgetDialog({ open, onOpenChange }: CreateBudgetDialogProps) {
  const { user } = useAuthStore()
  const createBudget = useCreateBudget()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { name: '', color: BUDGET_COLORS[0] },
  })

  useEffect(() => {
    if (!open) reset({ name: '', color: BUDGET_COLORS[0], type: undefined })
  }, [open, reset])

  async function onSubmit(data: CreateBudgetData) {
    if (!user) return
    await createBudget.mutateAsync({
      name: data.name,
      type: data.type,
      color: data.color,
      owner_id: user.id,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau budget</DialogTitle>
          <DialogDescription>
            Crée un budget indépendant avec ses propres catégories
          </DialogDescription>
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
            <Button type="submit" disabled={isSubmitting || createBudget.isPending}>
              {(isSubmitting || createBudget.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
