import { useQuery } from '@tanstack/react-query'

import { listCategories } from '@/features/categories/api'
import { STALE_TIME } from '@/lib/constants'

export function useCategories(budgetId: string | null | undefined) {
  return useQuery({
    queryKey: ['categories', budgetId],
    queryFn: () => listCategories(budgetId!),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
