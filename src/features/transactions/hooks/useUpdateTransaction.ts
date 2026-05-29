import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateTransaction } from '@/features/transactions/api'
import type { TablesUpdate } from '@/types/database'

export function useUpdateTransaction(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'transactions'> }) =>
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Transaction mise à jour')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
