import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createTransaction } from '@/features/transactions/api'
import type { TablesInsert } from '@/types/database'

export function useCreateTransaction(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TablesInsert<'transactions'>) => createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      toast.success('Transaction ajoutée')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
