import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAllAlertsRead } from '@/features/alerts/api'

export function useMarkAlertsRead(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllAlertsRead(budgetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', budgetId] }),
  })
}
