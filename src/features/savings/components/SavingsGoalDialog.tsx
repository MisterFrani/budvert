import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateSavingsGoal } from '@/features/savings/hooks/useCreateSavingsGoal'
import { useUpdateSavingsGoal } from '@/features/savings/hooks/useUpdateSavingsGoal'
import { type SavingsGoalData, savingsGoalSchema } from '@/features/savings/schemas'
import { getCategoryIcon, SAVINGS_GOAL_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type SavingsGoal = Tables<'savings_goals'>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string
  goal?: SavingsGoal
}

export function SavingsGoalDialog({ open, onOpenChange, budgetId, goal }: Props) {
  const isEdit = !!goal
  const create = useCreateSavingsGoal()
  const update = useUpdateSavingsGoal()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: { icon: 'piggy-bank', current_amount: 0 },
  })

  useEffect(() => {
    if (open) {
      if (goal) {
        reset({
          name: goal.name,
          icon: goal.icon ?? 'piggy-bank',
          target_amount: goal.target_amount,
          target_date: goal.target_date ?? undefined,
        })
      } else {
        reset({ icon: 'piggy-bank', current_amount: 0 })
      }
    }
  }, [open, goal, reset])

  const selectedIcon = watch('icon') ?? 'piggy-bank'

  async function onSubmit(data: SavingsGoalData) {
    if (isEdit) {
      await update.mutateAsync({
        id: goal.id,
        budgetId,
        updates: {
          name: data.name,
          icon: data.icon ?? null,
          target_amount: data.target_amount,
          target_date: data.target_date ?? null,
        },
      })
    } else {
      await create.mutateAsync({
        budgetId,
        payload: {
          name: data.name,
          icon: data.icon ?? null,
          target_amount: data.target_amount,
          current_amount: data.current_amount ?? 0,
          target_date: data.target_date ?? null,
        },
      })
    }
    onOpenChange(false)
  }

  const isPending = isSubmitting || create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'objectif" : 'Nouvel objectif'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input placeholder="Ex: Voyage au Japon" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Icône</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {SAVINGS_GOAL_ICONS.map((iconKey) => {
                const Icon = getCategoryIcon(iconKey)
                return (
                  <button
                    key={iconKey}
                    type="button"
                    aria-label={iconKey}
                    onClick={() => setValue('icon', iconKey)}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2 transition-colors',
                      selectedIcon === iconKey
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                        : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Montant cible (€)</Label>
            <Input type="number" min={0} step={0.01} placeholder="1 000" {...register('target_amount')} />
            {errors.target_amount && (
              <p className="text-xs text-red-500">{errors.target_amount.message}</p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Montant actuel (€)</Label>
              <Input type="number" min={0} step={0.01} placeholder="0" {...register('current_amount')} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Date cible (optionnel)</Label>
            <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} {...register('target_date')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
