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
import { Textarea } from '@/components/ui/textarea'
import { useAddContribution } from '@/features/savings/hooks/useAddContribution'
import { type ContributionData, contributionSchema } from '@/features/savings/schemas'
import type { Tables } from '@/types/database'

type SavingsGoal = Tables<'savings_goals'>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string
  goal: SavingsGoal
}

export function ContributionDialog({ open, onOpenChange, budgetId, goal }: Props) {
  const addContribution = useAddContribution()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContributionData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd') },
  })

  useEffect(() => {
    if (open) reset({ date: format(new Date(), 'yyyy-MM-dd') })
  }, [open, reset])

  async function onSubmit(data: ContributionData) {
    await addContribution.mutateAsync({
      goalId: goal.id,
      goalName: goal.name,
      budgetId,
      amount: data.amount,
      note: data.note,
      date: data.date,
    })
    onOpenChange(false)
  }

  const isPending = isSubmitting || addContribution.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter des fonds — {goal.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Montant (€)</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0,00"
              className="text-center text-xl font-bold"
              {...register('amount')}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" {...register('date')} />
          </div>

          <div className="space-y-1.5">
            <Label>Note (optionnel)</Label>
            <Textarea rows={2} placeholder="Ex: Virement du mois" {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
