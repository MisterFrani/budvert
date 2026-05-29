import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteCategory } from '@/features/categories/api'

export function useDeleteCategory(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Catégorie supprimée')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
