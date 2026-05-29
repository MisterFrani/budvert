import { useQuery } from '@tanstack/react-query'

import { listDebts } from '@/features/debts/api'
import { STALE_TIME } from '@/lib/constants'

export function useDebts(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: ['debts', budgetId],
    queryFn: () => listDebts(budgetId!),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
