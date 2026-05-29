import { useQuery } from '@tanstack/react-query'

import { listAlerts } from '@/features/alerts/api'
import { STALE_TIME } from '@/lib/constants'

export function useAlerts(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: ['alerts', budgetId],
    queryFn: () => listAlerts(budgetId!),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
