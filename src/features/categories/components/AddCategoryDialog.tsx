import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { useCreateCategory } from '@/features/categories/hooks/useCreateCategory'
import { getCategoryIcon, SELECTABLE_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const addSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  icon: z.string().min(1),
  amount: z.coerce.number().min(0),
  type: z.enum(['fixed', 'budget']),
})
type AddData = z.infer<typeof addSchema>

type Props = { open: boolean; onOpenChange: (o: boolean) => void; budgetId: string }

export function AddCategoryDialog({ open, onOpenChange, budgetId }: Props) {
  const createCategory = useCreateCategory(budgetId)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<AddData>({
      resolver: zodResolver(addSchema),
      defaultValues: { icon: 'package', type: 'budget', amount: 0 },
    })

  useEffect(() => {
    if (!open) reset({ icon: 'package', type: 'budget', amount: 0, name: '' })
  }, [open, reset])

  const selectedIcon = watch('icon')
  const selectedType = watch('type')

  async function onSubmit(data: AddData) {
    await createCategory.mutateAsync({
      name: data.name,
      icon: data.icon,
      amount: data.amount,
      type: data.type,
      color: '#6366f1',
      is_income: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle catégorie</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input {...register('name')} placeholder="Ex: Restaurants" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Icône</Label>
            <div className="grid grid-cols-10 gap-1">
              {SELECTABLE_ICONS.map((key) => {
                const Icon = getCategoryIcon(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('icon', key)}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2 transition-colors',
                      selectedIcon === key
                        ? 'bg-[#6366f1]/10 text-[#6366f1]'
                        : 'text-neutral-500 hover:bg-neutral-100',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Montant prévu (€)</Label>
            <Input type="number" min={0} step={0.01} {...register('amount')} />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(['fixed', 'budget'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    selectedType === t
                      ? 'border-[#6366f1] bg-indigo-50 text-[#6366f1]'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300',
                  )}
                >
                  {t === 'fixed' ? 'Fixe' : 'Enveloppe'}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || createCategory.isPending}>
              {(isSubmitting || createCategory.isPending) && (
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
