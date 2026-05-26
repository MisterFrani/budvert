import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createBudget } from '@/features/budgets/api'
import { useAuthStore } from '@/stores/authStore'
import { useBudgetStore } from '@/stores/budgetStore'
import type { TablesInsert } from '@/types/database'

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { setActiveBudgetId } = useBudgetStore()

  return useMutation({
    mutationFn: (payload: TablesInsert<'budgets'>) => createBudget(payload),
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] })
      setActiveBudgetId(budget.id)
      toast.success('Budget créé')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
