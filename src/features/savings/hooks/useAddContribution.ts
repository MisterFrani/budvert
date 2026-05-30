import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { addContribution } from '@/features/savings/api'
import { formatCurrency } from '@/lib/format'

type Vars = {
  goalId: string
  goalName: string
  budgetId: string
  amount: number
  note?: string
  date?: string
}

export function useAddContribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ goalId, goalName, budgetId, amount, note, date }: Vars) =>
      addContribution(goalId, goalName, budgetId, amount, note, date),
    onSuccess: (_data, { budgetId, goalName, amount }) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['summary', budgetId] })
      toast.success(`${formatCurrency(amount)} ajoutés à ${goalName}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
