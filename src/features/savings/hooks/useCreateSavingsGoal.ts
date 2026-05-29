import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createSavingsGoal } from '@/features/savings/api'
import type { TablesInsert } from '@/types/database'

type Vars = {
  budgetId: string
  payload: Omit<TablesInsert<'savings_goals'>, 'budget_id'>
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, payload }: Vars) => createSavingsGoal(budgetId, payload),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', budgetId] })
      toast.success('Objectif créé')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
