import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateCategory } from '@/features/categories/api'
import type { TablesUpdate } from '@/types/database'

export function useUpdateCategory(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'categories'> }) =>
      updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Catégorie mise à jour')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
