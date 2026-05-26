import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateBudget } from '@/features/budgets/api'
import { useAuthStore } from '@/stores/authStore'
import type { TablesUpdate } from '@/types/database'

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'budgets'> }) =>
      updateBudget(id, updates),
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['budget', budget.id] })
      toast.success('Budget mis à jour')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
