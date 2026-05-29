import { useQuery } from '@tanstack/react-query'

import { listSavingsGoals } from '@/features/savings/api'
import { STALE_TIME } from '@/lib/constants'

export function useSavingsGoals(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: ['savings-goals', budgetId],
    queryFn: () => listSavingsGoals(budgetId!),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
