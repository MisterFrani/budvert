import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { payInstallment } from '@/features/debts/api'
import { formatCurrency } from '@/lib/format'

type Vars = {
  debtId: string
  budgetId: string
  monthlyPayment: number
  currentPaidAmount: number
  totalAmount: number
}

export function usePayInstallment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ debtId, monthlyPayment }: Vars) => payInstallment(debtId, monthlyPayment),
    onSuccess: (_data, { budgetId, monthlyPayment, currentPaidAmount, totalAmount }) => {
      queryClient.invalidateQueries({ queryKey: ['debts', budgetId] })
      const newPaid = currentPaidAmount + monthlyPayment
      const settled = newPaid >= totalAmount
      if (settled) {
        toast.success('Dette soldée !', { description: 'Félicitations, ce crédit est entièrement remboursé.' })
      } else {
        const remaining = totalAmount - newPaid
        toast.success(`Mensualité payée — ${formatCurrency(remaining)} restants`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
