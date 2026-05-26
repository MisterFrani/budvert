import { useQuery } from '@tanstack/react-query'

import { fetchCategoriesByBudget } from '@/features/categories/api'

export function useCategories(budgetId: string) {
  return useQuery({
    queryKey: ['categories', budgetId],
    queryFn: () => fetchCategoriesByBudget(budgetId),
    enabled: !!budgetId,
    staleTime: 30_000,
  })
}
