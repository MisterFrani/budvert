import { FolderKanban, Heart, Home, User } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BUDGET_TYPE_VALUES, type CreateBudgetData } from '@/features/budgets/schemas'
import { BUDGET_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const BUDGET_TYPES = [
  { value: 'personal' as const, label: 'Personnel', icon: User },
  { value: 'couple' as const, label: 'Couple', icon: Heart },
  { value: 'colocation' as const, label: 'Colocation', icon: Home },
  { value: 'project' as const, label: 'Projet', icon: FolderKanban },
] satisfies Array<{
  value: (typeof BUDGET_TYPE_VALUES)[number]
  label: string
  icon: React.FC<{ className?: string }>
}>

type BudgetFormFieldsProps = {
  register: UseFormRegister<CreateBudgetData>
  watch: UseFormWatch<CreateBudgetData>
  setValue: UseFormSetValue<CreateBudgetData>
  errors: FieldErrors<CreateBudgetData>
}

export function BudgetFormFields({ register, watch, setValue, errors }: BudgetFormFieldsProps) {
  const selectedType = watch('type')
  const selectedColor = watch('color')

  return (
    <>
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
                selectedColor === color
                  ? 'scale-110 ring-2 ring-offset-2'
                  : 'border border-neutral-200',
              )}
              style={{ backgroundColor: color, ...(selectedColor === color ? { ringColor: color } : {}) }}
            />
          ))}
        </div>
        {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="overdraft-limit">Autorisation de découvert (€)</Label>
        <Input
          id="overdraft-limit"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          {...register('overdraft_limit', { valueAsNumber: true })}
        />
        {errors.overdraft_limit && <p className="text-sm text-red-500">{errors.overdraft_limit.message}</p>}
        <p className="text-xs text-neutral-400">
          Montant jusqu'auquel ton solde peut descendre sans dépassement. 0 = pas de découvert autorisé.
        </p>
      </div>
    </>
  )
}
