import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteSavingsGoal } from '@/features/savings/api'

type Vars = {
  id: string
  budgetId: string
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: Vars) => deleteSavingsGoal(id),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', budgetId] })
      toast.success('Objectif supprimé')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
