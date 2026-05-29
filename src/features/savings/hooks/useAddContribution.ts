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
    mutationFn: ({ goalId, amount, note, date }: Vars) =>
      addContribution(goalId, amount, note, date),
    onSuccess: (_data, { budgetId, goalName, amount }) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', budgetId] })
      toast.success(`${formatCurrency(amount)} ajoutés à ${goalName}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
