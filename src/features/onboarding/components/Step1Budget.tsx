import { zodResolver } from '@hookform/resolvers/zod'
import { FolderKanban, Heart, Home, Loader2, User } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBudget } from '@/features/budgets/api'
import { BUDGET_TYPE_VALUES,type Step1Data, step1Schema } from '@/features/onboarding/schemas'
import { BUDGET_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const BUDGET_TYPES = [
  { value: 'personal' as const, label: 'Personnel', icon: User },
  { value: 'couple' as const, label: 'Couple', icon: Heart },
  { value: 'colocation' as const, label: 'Colocation', icon: Home },
  { value: 'project' as const, label: 'Projet', icon: FolderKanban },
] satisfies Array<{ value: (typeof BUDGET_TYPE_VALUES)[number]; label: string; icon: React.FC<{ className?: string }> }>

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
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: 'Budget Personnel', color: BUDGET_COLORS[0] },
  })

  const selectedType = watch('type')
  const selectedColor = watch('color')

  async function onSubmit(data: Step1Data) {
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
      <div className="space-y-2">
        <Label htmlFor="budget-name">Nom du budget</Label>
        <Input id="budget-name" placeholder="Budget Personnel" {...register('name')} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Type de budget</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BUDGET_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('type', value, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                selectedType === value
                  ? 'border-[#6366f1] bg-indigo-50 text-[#6366f1]'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Couleur</Label>
        <div className="flex gap-3">
          {BUDGET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              className={cn(
                'h-8 w-8 rounded-full transition-transform',
                selectedColor === color ? 'scale-110 border-2 border-offset-2 ring-2 ring-offset-2' : 'border border-neutral-200',
              )}
              style={{
                backgroundColor: color,
                ringColor: color,
              }}
            />
          ))}
        </div>
        {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
      </div>

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
