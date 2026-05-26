import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteBudget } from '@/features/budgets/api'
import { useAuthStore } from '@/stores/authStore'
import { useBudgetStore } from '@/stores/budgetStore'

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { activeBudgetId, setActiveBudgetId } = useBudgetStore()

  return useMutation({
    mutationFn: ({ id, totalCount }: { id: string; totalCount: number }) =>
      deleteBudget(id, totalCount),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] })
      if (id === activeBudgetId) {
        const cached = queryClient.getQueryData<Array<{ id: string }>>(['budgets', user?.id])
        const remaining = cached?.filter((b) => b.id !== id)
        if (remaining && remaining.length > 0) {
          setActiveBudgetId(remaining[0].id)
        }
      }
      toast.success('Budget supprimé')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
