import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createDebt } from '@/features/debts/api'
import type { TablesInsert } from '@/types/database'

type Vars = {
  budgetId: string
  payload: Omit<TablesInsert<'debts'>, 'budget_id'>
}

export function useCreateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, payload }: Vars) => createDebt(budgetId, payload),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['debts', budgetId] })
      toast.success('Dette ajoutée')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
