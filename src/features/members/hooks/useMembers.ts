import { useQuery } from '@tanstack/react-query'

import { listMembers } from '@/features/members/api'
import { STALE_TIME } from '@/lib/constants'

export function useMembers(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: ['members', budgetId],
    queryFn: () => listMembers(budgetId!),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
