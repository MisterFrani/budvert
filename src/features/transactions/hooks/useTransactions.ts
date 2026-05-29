import { useQuery } from '@tanstack/react-query'

import { listTransactions, type TransactionFilters } from '@/features/transactions/api'
import { STALE_TIME } from '@/lib/constants'

export function useTransactions(budgetId: string | null | undefined, filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', budgetId, filters ?? {}],
    queryFn: () => listTransactions(budgetId!, filters),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
