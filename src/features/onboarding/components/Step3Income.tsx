import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBudget } from '@/features/budgets/api'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { type Step3Data,step3Schema } from '@/features/onboarding/schemas'
import { formatCurrency } from '@/lib/format'

type Step3Props = {
  budgetId: string
  onBack: () => void
  onComplete: () => void
}

export function Step3Income({ budgetId, onBack, onComplete }: Step3Props) {
  const { data: categories } = useCategories(budgetId)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { monthly_income: 0 },
  })

  const income = Number(watch('monthly_income')) || 0
  const totalFixed =
    categories
      ?.filter((c) => c.type === 'fixed')
      .reduce((sum, c) => sum + c.amount, 0) ?? 0
  const available = income - totalFixed

  async function onSubmit(data: Step3Data) {
    try {
      await updateBudget(budgetId, { monthly_income: data.monthly_income })
      onComplete()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="income">Montant net mensuel</Label>
        <div className="relative">
          <Input
            id="income"
            type="number"
            min={0}
            step={1}
            placeholder="2500"
            className="h-14 pr-10 text-xl font-medium"
            {...register('monthly_income')}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-neutral-400">
            €
          </span>
        </div>
        {errors.monthly_income && (
          <p className="text-sm text-red-500">{errors.monthly_income.message}</p>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Revenus</span>
          <span className="font-medium">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Charges fixes</span>
          <span className="font-medium text-red-500">− {formatCurrency(totalFixed)}</span>
        </div>
        <div className="mt-2 border-t border-neutral-200 pt-2 flex items-center justify-between">
          <span className="font-medium">Disponible chaque mois</span>
          <span
            className={`text-lg font-semibold ${available >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}
          >
            {formatCurrency(available)}
          </span>
        </div>
      </div>

      {errors.root && <p className="text-center text-sm text-red-500">{errors.root.message}</p>}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" className="h-11" onClick={onBack}>
          Précédent
        </Button>
        <Button type="submit" className="h-11 px-8 font-medium" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Terminer
        </Button>
      </div>
    </form>
  )
}
