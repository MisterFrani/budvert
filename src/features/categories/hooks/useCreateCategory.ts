import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createCategory } from '@/features/categories/api'
import type { TablesInsert } from '@/types/database'

export function useCreateCategory(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<TablesInsert<'categories'>, 'budget_id'>) =>
      createCategory(budgetId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Catégorie créée')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
