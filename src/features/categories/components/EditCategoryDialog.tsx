import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { useDeleteCategory } from '@/features/categories/hooks/useDeleteCategory'
import { useUpdateCategory } from '@/features/categories/hooks/useUpdateCategory'
import { getCategoryIcon, SELECTABLE_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Category = Tables<'categories'>

const editSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  amount: z.coerce.number().min(0),
  type: z.enum(['fixed', 'budget']),
  alert_threshold: z.coerce.number().min(50).max(100),
})
type EditData = z.infer<typeof editSchema>

type Props = { open: boolean; onOpenChange: (o: boolean) => void; category: Category; budgetId: string }

export function EditCategoryDialog({ open, onOpenChange, category, budgetId }: Props) {
  const updateCategory = useUpdateCategory(budgetId)
  const deleteCategory = useDeleteCategory(budgetId)

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<EditData>({
      resolver: zodResolver(editSchema),
      defaultValues: {
        name: category.name,
        icon: category.icon,
        amount: category.amount,
        type: category.type as 'fixed' | 'budget',
        alert_threshold: category.alert_threshold ?? 80,
      },
    })

  useEffect(() => {
    if (open) {
      reset({
        name: category.name,
        icon: category.icon,
        amount: category.amount,
        type: category.type as 'fixed' | 'budget',
        alert_threshold: category.alert_threshold ?? 80,
      })
    }
  }, [open, category, reset])

  const selectedIcon = watch('icon')
  const selectedType = watch('type')
  const threshold = watch('alert_threshold')

  async function onSubmit(data: EditData) {
    await updateCategory.mutateAsync({ id: category.id, updates: data })
    onOpenChange(false)
  }

  async function handleDelete() {
    await deleteCategory.mutateAsync(category.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input {...register('name')} />
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

          <div className="space-y-1.5">
            <Label>Seuil d'alerte : {threshold}%</Label>
            <Controller
              name="alert_threshold"
              control={control}
              render={({ field }) => (
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full accent-[#6366f1]"
                />
              )}
            />
          </div>

          <DialogFooter className="flex-row items-center justify-between sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600">
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Toutes les transactions associées seront désassociées. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || updateCategory.isPending}>
                {(isSubmitting || updateCategory.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
