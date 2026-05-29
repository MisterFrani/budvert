import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteDebt } from '@/features/debts/api'

type Vars = {
  id: string
  budgetId: string
}

export function useDeleteDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: Vars) => deleteDebt(id),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['debts', budgetId] })
      toast.success('Dette supprimée')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
