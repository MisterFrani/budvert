import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateDebt } from '@/features/debts/api'
import type { TablesUpdate } from '@/types/database'

type Vars = {
  id: string
  budgetId: string
  updates: TablesUpdate<'debts'>
}

export function useUpdateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: Vars) => updateDebt(id, updates),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['debts', budgetId] })
      toast.success('Dette mise à jour')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
