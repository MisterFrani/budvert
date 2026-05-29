import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useCreateTransaction } from '@/features/transactions/hooks/useCreateTransaction'
import { useDeleteTransaction } from '@/features/transactions/hooks/useDeleteTransaction'
import { useUpdateTransaction } from '@/features/transactions/hooks/useUpdateTransaction'
import { type TransactionData,transactionSchema } from '@/features/transactions/schemas'
import { getCategoryIcon } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Tables } from '@/types/database'

type Transaction = Tables<'transactions'>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
}

export function TransactionSheet({ open, onOpenChange, transaction }: Props) {
  const { user } = useAuthStore()
  const { activeBudgetId } = useActiveBudget()
  const { data: categories } = useCategories(activeBudgetId)

  const createTransaction = useCreateTransaction(activeBudgetId ?? '')
  const updateTransaction = useUpdateTransaction(activeBudgetId ?? '')
  const deleteTransaction = useDeleteTransaction(activeBudgetId ?? '')

  const isEdit = !!transaction

  const { register, handleSubmit, control, watch, setValue, reset, formState: { isSubmitting } } =
    useForm<TransactionData>({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        is_recurring: false,
      },
    })

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type as 'expense' | 'income',
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          category_id: transaction.category_id ?? undefined,
          notes: transaction.notes ?? undefined,
          is_recurring: transaction.is_recurring ?? false,
          recurrence_rule: transaction.recurrence_rule as 'monthly' | 'weekly' | undefined,
        })
      } else {
        reset({ type: 'expense', date: format(new Date(), 'yyyy-MM-dd'), is_recurring: false })
      }
    }
  }, [open, transaction, reset])

  const selectedType = watch('type')
  const isRecurring = watch('is_recurring')

  async function onSubmit(data: TransactionData) {
    if (!activeBudgetId || !user) return

    const payload = {
      budget_id: activeBudgetId,
      created_by: user.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      category_id: data.category_id ?? null,
      notes: data.notes ?? null,
      is_recurring: data.is_recurring,
      recurrence_rule: data.is_recurring ? (data.recurrence_rule ?? 'monthly') : null,
    }

    if (isEdit) {
      await updateTransaction.mutateAsync({ id: transaction.id, updates: payload })
    } else {
      await createTransaction.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!transaction) return
    await deleteTransaction.mutateAsync(transaction.id)
    onOpenChange(false)
  }

  const isPending = isSubmitting || createTransaction.isPending || updateTransaction.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Modifier la transaction' : 'Nouvelle transaction'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t)}
                className={cn(
                  'flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors',
                  selectedType === t
                    ? t === 'expense'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300',
                )}
              >
                {t === 'expense' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Montant (€)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              className="text-center text-2xl font-bold h-14"
              placeholder="0,00"
              {...register('amount')}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input placeholder="Ex: Courses Monoprix" {...register('description')} />
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" {...register('date')} />
          </div>

          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sans catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => {
                      const Icon = getCategoryIcon(cat.icon)
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {cat.name}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Note (optionnel)</Label>
            <Textarea rows={2} placeholder="Commentaire..." {...register('notes')} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
            <Label className="cursor-pointer">Récurrente</Label>
            <Controller
              name="is_recurring"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          {isRecurring && (
            <div className="space-y-1.5">
              <Label>Fréquence</Label>
              <Controller
                name="recurrence_rule"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? 'monthly'} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex-1" />

          <SheetFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                onClick={handleDelete}
                disabled={deleteTransaction.isPending}
              >
                {deleteTransaction.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
