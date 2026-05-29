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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateDebt } from '@/features/debts/hooks/useCreateDebt'
import { useUpdateDebt } from '@/features/debts/hooks/useUpdateDebt'
import { type DebtData, debtSchema } from '@/features/debts/schemas'
import type { Tables } from '@/types/database'

type Debt = Tables<'debts'>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string
  debt?: Debt
}

export function DebtDialog({ open, onOpenChange, budgetId, debt }: Props) {
  const isEdit = !!debt
  const create = useCreateDebt()
  const update = useUpdateDebt()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtData>({
    resolver: zodResolver(debtSchema),
    defaultValues: { paid_amount: 0, interest_rate: 0 },
  })

  useEffect(() => {
    if (open) {
      if (debt) {
        reset({
          creditor: debt.creditor,
          total_amount: debt.total_amount,
          monthly_payment: debt.monthly_payment,
          interest_rate: debt.interest_rate ?? 0,
          end_date: debt.end_date ?? undefined,
        })
      } else {
        reset({ paid_amount: 0, interest_rate: 0 })
      }
    }
  }, [open, debt, reset])

  async function onSubmit(data: DebtData) {
    if (isEdit) {
      await update.mutateAsync({
        id: debt.id,
        budgetId,
        updates: {
          creditor: data.creditor,
          total_amount: data.total_amount,
          monthly_payment: data.monthly_payment,
          interest_rate: data.interest_rate ?? 0,
          end_date: data.end_date ?? null,
        },
      })
    } else {
      await create.mutateAsync({
        budgetId,
        payload: {
          creditor: data.creditor,
          total_amount: data.total_amount,
          paid_amount: data.paid_amount ?? 0,
          monthly_payment: data.monthly_payment,
          interest_rate: data.interest_rate ?? 0,
          end_date: data.end_date ?? null,
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
          <DialogTitle>{isEdit ? 'Modifier la dette' : 'Nouvelle dette'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Créancier</Label>
            <Input placeholder="Ex: Crédit Agricole, Mohamed…" {...register('creditor')} />
            {errors.creditor && <p className="text-xs text-red-500">{errors.creditor.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Montant total (€)</Label>
              <Input type="number" min={0} step={0.01} placeholder="10 000" {...register('total_amount')} />
              {errors.total_amount && (
                <p className="text-xs text-red-500">{errors.total_amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Mensualité (€)</Label>
              <Input type="number" min={0} step={0.01} placeholder="200" {...register('monthly_payment')} />
              {errors.monthly_payment && (
                <p className="text-xs text-red-500">{errors.monthly_payment.message}</p>
              )}
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Déjà remboursé (€)</Label>
              <Input type="number" min={0} step={0.01} placeholder="0" {...register('paid_amount')} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Taux d&apos;intérêt (%)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                {...register('interest_rate')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date de fin (optionnel)</Label>
              <Input type="date" {...register('end_date')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
