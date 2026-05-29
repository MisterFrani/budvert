import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteTransaction } from '@/features/transactions/api'

export function useDeleteTransaction(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Transaction supprimée')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
