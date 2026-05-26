import { useQuery } from '@tanstack/react-query'

import { fetchUserBudgets } from '@/features/budgets/api'
import { useAuthStore } from '@/stores/authStore'

export function useUserBudgets() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: () => fetchUserBudgets(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  })
}
