import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { updateCategory } from '@/features/categories/api'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { type Step2Data,step2Schema } from '@/features/onboarding/schemas'
import { getCategoryIcon } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type Step2Props = {
  budgetId: string
  onBack: () => void
  onComplete: () => void
}

export function Step2Categories({ budgetId, onBack, onComplete }: Step2Props) {
  const { data: categories, isPending } = useCategories(budgetId)
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { categories: [] } })

  const { fields } = useFieldArray({ control, name: 'categories' })
  const watchedCategories = watch('categories')

  useEffect(() => {
    if (categories) {
      reset({
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          amount: c.amount,
          type: c.type as 'fixed' | 'budget',
        })),
      })
    }
  }, [categories, reset])

  async function onSubmit(data: Step2Data) {
    await Promise.all(
      data.categories.map((cat) =>
        updateCategory(cat.id, { name: cat.name, amount: cat.amount, type: cat.type }),
      ),
    )
    onComplete()
  }

  const totalFixed = watchedCategories
    .filter((c) => c.type === 'fixed')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        {fields.map((field, index) => {
          const cat = watchedCategories[index]
          const Icon = categories ? getCategoryIcon(categories[index]?.icon ?? '') : null
          const isFixed = cat?.type === 'fixed'

          return (
            <div
              key={field.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              {Icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Icon className="h-4 w-4 text-neutral-600" />
                </div>
              )}

              <Input
                {...register(`categories.${index}.name`)}
                className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                placeholder="Nom"
              />

              <div className="flex items-center gap-1">
                <Input
                  {...register(`categories.${index}.amount`)}
                  type="number"
                  min={0}
                  step={0.01}
                  className="h-8 w-24 text-right text-sm"
                  placeholder="0"
                />
                <span className="text-sm text-neutral-500">€</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setValue(
                    `categories.${index}.type`,
                    isFixed ? 'budget' : 'fixed',
                    { shouldValidate: true },
                  )
                }
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  isFixed
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                )}
              >
                {isFixed ? 'Fixe' : 'Budget'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
        <span className="text-sm text-neutral-500">Total charges fixes</span>
        <span className="font-semibold">{formatCurrency(totalFixed)}</span>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" className="h-11" onClick={onBack}>
          Précédent
        </Button>
        <Button type="submit" className="h-11 px-8 font-medium" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Suivant
        </Button>
      </div>
    </form>
  )
}
