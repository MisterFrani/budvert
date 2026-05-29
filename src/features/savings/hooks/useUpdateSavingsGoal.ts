import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateSavingsGoal } from '@/features/savings/api'
import type { TablesUpdate } from '@/types/database'

type Vars = {
  id: string
  budgetId: string
  updates: TablesUpdate<'savings_goals'>
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: Vars) => updateSavingsGoal(id, updates),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', budgetId] })
      toast.success('Objectif mis à jour')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
