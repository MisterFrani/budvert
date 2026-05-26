import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { createBudget } from '@/features/budgets/api'
import { BudgetFormFields } from '@/features/budgets/components/BudgetForm'
import { type CreateBudgetData,createBudgetSchema } from '@/features/budgets/schemas'
import { BUDGET_COLORS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

type Step1Props = {
  onComplete: (budgetId: string) => void
}

export function Step1Budget({ onComplete }: Step1Props) {
  const { user } = useAuthStore()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { name: 'Budget Personnel', color: BUDGET_COLORS[0] },
  })

  async function onSubmit(data: CreateBudgetData) {
    if (!user) return
    try {
      const budget = await createBudget({
        name: data.name,
        type: data.type,
        color: data.color,
        owner_id: user.id,
      })
      onComplete(budget.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <BudgetFormFields register={register} watch={watch} setValue={setValue} errors={errors} />

      {errors.root && <p className="text-center text-sm text-red-500">{errors.root.message}</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-11 px-8 font-medium" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Suivant
        </Button>
      </div>
    </form>
  )
}
